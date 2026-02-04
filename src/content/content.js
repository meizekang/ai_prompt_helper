let currentOverlay = null;
let activeElement = null;
let prompts = [];
let settings = {};
let isInserting = false;

// Load data and init I18n
async function initialize() {
  await I18n.init(); // Wait for language load
  
  chrome.storage.local.get(['prompts', 'settings'], (result) => {
    prompts = (result.prompts || []).filter(p => p.enabled !== false);
    settings = result.settings || { globalEnabled: true, domains: [] };
    
    // Check global switch
    if (settings.globalEnabled === false) return;

    const currentDomain = window.location.hostname;
    
    // Find matching domain config
    const domainConfig = settings.domains.find(d => currentDomain.includes(d.url));
    
    // Only init if domain is found and enabled
    if (domainConfig && domainConfig.enabled) {
      initListeners();
    }
  });
}

// Listen for storage changes to update language on the fly
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.settings) {
      const newSettings = changes.settings.newValue;
      if (newSettings && newSettings.language && newSettings.language !== I18n.locale) {
        I18n.setLocale(newSettings.language);
      }
    }
    
    if (changes.prompts) {
      prompts = (changes.prompts.newValue || []).filter(p => p.enabled !== false);
    }
  }
});

function initListeners() {
  document.addEventListener('input', handleInput);
  document.addEventListener('click', onDocumentClick);
}

function removeListeners() {
  document.removeEventListener('input', handleInput);
  document.removeEventListener('click', onDocumentClick);
}

function onDocumentClick(e) {
  if (currentOverlay && !currentOverlay.contains(e.target) && e.target !== activeElement) {
    removeOverlay();
  }
}

function handleInput(e) {
  if (isInserting) return;
  const target = e.target;
  // Ignore inputs inside our own UI
  if (target.closest('.ai-helper-modal') || target.closest('.ai-helper-overlay')) return;

  if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) return;

  activeElement = target;
  const value = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' ? target.value : target.innerText;

  if (!value) {
    removeOverlay();
    return;
  }

  const matches = prompts.filter(p => p.title.toLowerCase().includes(value.toLowerCase()) || p.content.toLowerCase().includes(value.toLowerCase()));
  
  if (matches.length > 0) {
    showOverlay(target, matches);
  } else {
    removeOverlay();
  }
}

function showOverlay(target, matches) {
  removeOverlay();

  const rect = target.getBoundingClientRect();
  const overlay = document.createElement('div');
  overlay.className = 'ai-helper-overlay';
  overlay.style.top = `${rect.top + window.scrollY - 10}px`;
  overlay.style.left = `${rect.left + window.scrollX}px`;
  overlay.style.transform = 'translateY(-100%)';

  const header = document.createElement('div');
  header.className = 'ai-helper-header';
  header.innerHTML = `
    <span>${I18n.getMessage('overlayHeader')}</span>
    <div class="ai-helper-actions">
      <div class="ai-helper-switch-container">
        <label class="ai-helper-switch">
          <input type="checkbox" checked>
          <span class="ai-helper-slider"></span>
          <div class="ai-helper-tooltip">${I18n.getMessage('disableSiteHint')}</div>
        </label>
      </div>
      <span class="ai-helper-close">&times;</span>
    </div>
  `;

  const toggle = header.querySelector('input[type="checkbox"]');
  toggle.onchange = (e) => {
    if (!e.target.checked) {
      disableForThisSite();
      removeOverlay();
    }
  };

  header.querySelector('.ai-helper-close').onclick = () => {
    removeOverlay();
  };
  overlay.appendChild(header);

  const list = document.createElement('ul');
  list.className = 'ai-helper-list';
  matches.forEach(p => {
    const li = document.createElement('li');
    li.className = 'ai-helper-item';
    li.innerHTML = `
      <span class="ai-helper-item-title">${p.title}</span>
      <span class="ai-helper-item-content">${p.content.replace(/\{\{(.+?)\}\}/g, '...') }</span>
    `;
    li.onclick = () => selectPrompt(p);
    list.appendChild(li);
  });
  overlay.appendChild(list);

  document.body.appendChild(overlay);
  currentOverlay = overlay;
}

function removeOverlay() {
  if (currentOverlay) {
    currentOverlay.remove();
    currentOverlay = null;
  }
}

function disableForThisSite() {
  const currentDomain = window.location.hostname;
  chrome.storage.local.get(['settings'], (result) => {
    const s = result.settings || { domains: [] };
    const domainConfig = s.domains.find(d => currentDomain.includes(d.url));
    
    if (domainConfig) {
      domainConfig.enabled = false;
      chrome.storage.local.set({ settings: s });
      removeListeners();
    }
  });
}

function selectPrompt(prompt) {
  removeOverlay();
  if (prompt.placeholders && prompt.placeholders.length > 0) {
    showPlaceholderModal(prompt);
  } else {
    insertText(prompt.content);
  }
}

function showPlaceholderModal(prompt) {
  const backdrop = document.createElement('div');
  backdrop.className = 'ai-helper-backdrop';
  
  const modal = document.createElement('div');
  modal.className = 'ai-helper-modal';
  modal.innerHTML = `<h3>${prompt.title}</h3>`;
  
  const inputs = {};
  prompt.placeholders.forEach(ph => {
    const label = document.createElement('label');
    label.className = 'ai-helper-modal-label';
    label.innerText = ph;
    modal.appendChild(label);

    const input = document.createElement('input');
    input.placeholder = `${I18n.getMessage('modalInputPlaceholder')} ${ph}...`;
    modal.appendChild(input);
    inputs[ph] = input;
  });

  const btnGroup = document.createElement('div');
  btnGroup.className = 'ai-helper-modal-buttons';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'ai-helper-btn ai-helper-btn-secondary';
  cancelBtn.innerText = I18n.getMessage('modalCancel');
  cancelBtn.onclick = () => backdrop.remove();

  const okBtn = document.createElement('button');
  okBtn.className = 'ai-helper-btn ai-helper-btn-primary';
  okBtn.innerText = I18n.getMessage('modalConfirm');
  okBtn.onclick = () => {
    let finalContent = prompt.content;
    for (const ph in inputs) {
      finalContent = finalContent.replace(new RegExp(`\\{\\{${ph}\\}\\}`, 'g'), inputs[ph].value);
    }
    insertText(finalContent);
    backdrop.remove();
  };

  btnGroup.appendChild(cancelBtn);
  btnGroup.appendChild(okBtn);
  modal.appendChild(btnGroup);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  
  // 自动聚焦第一个输入框
  const firstInput = modal.querySelector('input');
  if (firstInput) setTimeout(() => firstInput.focus(), 100);
}

function insertText(text) {
  if (!activeElement) return;
  
  isInserting = true;
  if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
    activeElement.value = text;
  } else if (activeElement.isContentEditable) {
    activeElement.innerText = text;
  }
  
  // Trigger input event for frameworks like React/Vue
  activeElement.dispatchEvent(new Event('input', { bubbles: true }));
  isInserting = false;
}

// Start
initialize();
