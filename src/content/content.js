let currentOverlay = null;
let activeElement = null;
let prompts = [];
let settings = {};

// Load data
chrome.storage.local.get(['prompts', 'settings'], (result) => {
  prompts = result.prompts || [];
  settings = result.settings || { globalEnabled: true, domains: [] };
  
  // Check global switch
  if (settings.globalEnabled === false) return;

  const currentDomain = window.location.hostname;
  
  // Find matching domain config
  const domainConfig = settings.domains.find(d => currentDomain.includes(d.url));
  
  // Only init if domain is found and enabled
  if (domainConfig && domainConfig.enabled) {
    init();
  }
});

function init() {
  document.addEventListener('input', handleInput);
  document.addEventListener('click', (e) => {
    if (currentOverlay && !currentOverlay.contains(e.target) && e.target !== activeElement) {
      removeOverlay();
    }
  });
}

function handleInput(e) {
  const target = e.target;
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
  header.innerHTML = `<span>提示词匹配</span><span class="ai-helper-close">&times;</span>`;
  header.querySelector('.ai-helper-close').onclick = () => {
    disableForThisSite();
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
      // Optionally reload to stop listening
      // location.reload(); 
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
    input.placeholder = `请输入 ${ph}...`;
    modal.appendChild(input);
    inputs[ph] = input;
  });

  const btnGroup = document.createElement('div');
  btnGroup.className = 'ai-helper-modal-buttons';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'ai-helper-btn ai-helper-btn-secondary';
  cancelBtn.innerText = '取消';
  cancelBtn.onclick = () => backdrop.remove();

  const okBtn = document.createElement('button');
  okBtn.className = 'ai-helper-btn ai-helper-btn-primary';
  okBtn.innerText = '确定并插入';
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
  
  if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
    activeElement.value = text;
  } else if (activeElement.isContentEditable) {
    activeElement.innerText = text;
  }
  
  // Trigger input event for frameworks like React/Vue
  activeElement.dispatchEvent(new Event('input', { bubbles: true }));
}
