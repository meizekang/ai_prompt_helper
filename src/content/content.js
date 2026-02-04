if (!window.aiHelperContentScriptLoaded) {
  window.aiHelperContentScriptLoaded = true;

  let currentOverlay = null;
let activeElement = null;
let prompts = [];
let settings = {};
let isInserting = false;
// Track input values to handle cases where input is cleared before we read it
const inputHistory = new WeakMap();

// Load data and init I18n
async function initialize() {
  await I18n.init(); // Wait for language load
  
  chrome.storage.local.get(['prompts', 'settings'], (result) => {
    prompts = (result.prompts || []).filter(p => p.enabled !== false);
    settings = result.settings || { globalEnabled: true, domains: [], autoSavePromptOnEnter: true };
    
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
      // Update local settings object
      if (newSettings) {
        settings = newSettings;
      }
    }
    
    if (changes.prompts) {
      prompts = (changes.prompts.newValue || []).filter(p => p.enabled !== false);
    }
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "open_save_prompt_modal") {
    showAddPromptModal(request.text);
  }
});

function initListeners() {
  document.addEventListener('input', handleInput);
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', handleKeyDown, true); // Use capture to ensure we see it
}

function removeListeners() {
  document.removeEventListener('input', handleInput);
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', handleKeyDown, true);
}

function onDocumentClick(e) {
  if (currentOverlay && !currentOverlay.contains(e.target) && e.target !== activeElement) {
    removeOverlay();
  }
  // Also remove save confirmation if clicked outside
  const saveConfirm = document.querySelector('.ai-helper-save-confirm');
  if (saveConfirm && !saveConfirm.contains(e.target)) {
    saveConfirm.remove();
  }
}

// Helper to find the true editable root
function findEditableRoot(element) {
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') return element;
  
  let root = element;
  // Walk up until we find an element that is explicitly contenteditable="true" or we hit body
  while (root && root.parentElement && root.tagName !== 'BODY') {
    if (root.getAttribute('contenteditable') === 'true' || root.getAttribute('role') === 'textbox' || root.getAttribute('g_editable') === 'true') {
      return root;
    }
    // Check parent
    if (root.parentElement.isContentEditable || root.parentElement.getAttribute('contenteditable') === 'true') {
      // Keep going up
      root = root.parentElement;
    } else {
      break; 
    }
  }
  return root;
}

// Helper to get text from an element (handling inputs and contenteditables)
function getElementText(element) {
  if (!element) return '';
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    return element.value;
  }
  // For contenteditable, innerText is usually best for "visible" text
  // Some editors might use textContent if innerText is empty/hidden?
  return element.innerText || element.textContent;
}

function handleKeyDown(e) {
  if ((e.key !== 'Enter' && e.keyCode !== 13) || e.shiftKey) return;
  
  // Ignore if user is composing text (IME)
  if (e.isComposing || e.keyCode === 229) return;
  
  // Check setting (default true if undefined for existing users, but we set default above)
  if (settings.autoSavePromptOnEnter === false) return;

  const target = e.target;
  // Ignore inputs inside our own UI
  if (target.closest('.ai-helper-modal') || target.closest('.ai-helper-overlay') || target.closest('.ai-helper-save-confirm')) return;

  // Expanded check for editable elements (some custom editors don't set isContentEditable on the target immediately)
  // We use findEditableRoot to determine if we are in an editor context
  const root = findEditableRoot(target);
  
  // If no root found, or root is body (and target isn't explicitly editable), ignore
  if (!root) return;
  if (root.tagName === 'BODY' && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) return;

  let value = getElementText(root);

  // Fallback to history if current value is empty (e.g. site cleared it immediately)
  // We check history for the root element
  if ((!value || value.trim().length === 0) && inputHistory.has(root)) {
     value = inputHistory.get(root);
  }

  // Simple validation: must have content
  if (value && value.trim().length > 0) {
    // Show confirmation
    showSaveConfirmation(value.trim(), target);
  }
}

function showSaveConfirmation(text, target) {
  // Remove existing confirmation if any
  const existing = document.querySelector('.ai-helper-save-confirm');
  if (existing) existing.remove();

  const confirmEl = document.createElement('div');
  confirmEl.className = 'ai-helper-save-confirm';
  
  const rect = target.getBoundingClientRect();
  
  // Calculate position (above input, centered) - Fixed position, relative to viewport
  let top = rect.top - 50;
  let left = rect.left + (rect.width / 2) - 100; // Center roughly
  
  // Adjust if out of bounds (viewport)
  if (top < 10) top = rect.bottom + 10; // Show below if no space above
  if (left < 10) left = 10;
  if (left + 200 > window.innerWidth) left = window.innerWidth - 210;

  confirmEl.style.top = `${top}px`;
  confirmEl.style.left = `${left}px`;

  confirmEl.innerHTML = `
    <span>${I18n.getMessage('savePromptConfirm')}</span>
    <button class="ai-helper-btn-xs ai-helper-btn-primary" id="ai-confirm-save">${I18n.getMessage('modalConfirm')}</button>
    <button class="ai-helper-close-icon" id="ai-cancel-save">&times;</button>
  `;

  document.body.appendChild(confirmEl);
  
  // Auto remove after 10 seconds if no interaction
  const timer = setTimeout(() => {
    if (confirmEl.isConnected) confirmEl.remove();
  }, 10000);

  confirmEl.querySelector('#ai-confirm-save').onclick = () => {
    clearTimeout(timer);
    confirmEl.remove();
    showAddPromptModal(text);
  };

  confirmEl.querySelector('#ai-cancel-save').onclick = () => {
    clearTimeout(timer);
    confirmEl.remove();
  };
}

function handleInput(e) {
  if (isInserting) return;
  const target = e.target;
  // Ignore inputs inside our own UI
  if (target.closest('.ai-helper-modal') || target.closest('.ai-helper-overlay')) return;

  const root = findEditableRoot(target);
  if (!root) return;
  // If root is body, and target isn't explicitly editable, ignore
  if (root.tagName === 'BODY' && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) return;

  activeElement = target;
  
  // Get text from the root editable container
  const value = getElementText(root);

  // Update history for the root element
  if (value) {
    inputHistory.set(root, value);
  }

  // Use the specific value for matching prompts (current word/partial)
  // For prompt matching, we might want the cursor position context, but current logic uses full text inclusion?
  // Current logic: prompts.filter(p => p.title...includes(value) || p.content...includes(value))
  // The 'value' used for matching was originally target.value/innerText.
  // If we are in a <p>, innerText is the paragraph. That's probably what we want for matching?
  // Or do we want the whole text?
  // The original code used `target.value` or `target.innerText`.
  // If target is <p>, it used <p>'s text.
  // Let's stick to using the specific target's text for matching to avoid matching against huge text blocks,
  // but use root for history tracking.
  const matchValue = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' ? target.value : target.innerText;

  if (!matchValue) {
    removeOverlay();
    return;
  }

  const matches = prompts.filter(p => p.title.toLowerCase().includes(matchValue.toLowerCase()) || p.content.toLowerCase().includes(matchValue.toLowerCase()));
  
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
          <div class="ai-helper-tooltip">${I18n.getMessage('disableSite')}</div>
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
    const domains = s.domains || [];
    const domainConfig = domains.find(d => currentDomain.includes(d.url));
    
    if (domainConfig) {
      domainConfig.enabled = false;
      // We must save the full structure back
      if (!s.domains) s.domains = domains;
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

function showAddPromptModal(initialContent) {
  // Clean up any existing modal to prevent duplicates
  const existingBackdrop = document.querySelector('.ai-helper-backdrop');
  if (existingBackdrop) existingBackdrop.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'ai-helper-backdrop';
  
  const modal = document.createElement('div');
  modal.className = 'ai-helper-modal';
  modal.style.width = '500px'; // Wider for editing
  
  modal.innerHTML = `
    <h3>${I18n.getMessage('newPromptLabel') || '新建提示词'}</h3>
    
    <label class="ai-helper-modal-label">${I18n.getMessage('promptTitlePlaceholder') || '标题'}</label>
    <input type="text" id="ai-helper-new-title" placeholder="${I18n.getMessage('promptTitlePlaceholder') || '标题'}" class="ai-helper-input">
    
    <label class="ai-helper-modal-label">${I18n.getMessage('promptContentPlaceholder') || '内容'}</label>
    <textarea id="ai-helper-new-content" placeholder="${I18n.getMessage('promptContentPlaceholder') || '内容'}" class="ai-helper-textarea" style="height: 150px; width: 100%; box-sizing: border-box; margin-bottom: 16px; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical;"></textarea>
    
    <div class="ai-helper-modal-buttons">
      <button class="ai-helper-btn ai-helper-btn-secondary" id="ai-helper-cancel-btn">${I18n.getMessage('modalCancel')}</button>
      <button class="ai-helper-btn ai-helper-btn-primary" id="ai-helper-save-btn">${I18n.getMessage('addPromptBtn') || '保存'}</button>
    </div>
  `;

  const titleInput = modal.querySelector('#ai-helper-new-title');
  const contentInput = modal.querySelector('#ai-helper-new-content');
  const cancelBtn = modal.querySelector('#ai-helper-cancel-btn');
  const saveBtn = modal.querySelector('#ai-helper-save-btn');

  contentInput.value = initialContent || '';
  
  cancelBtn.onclick = () => backdrop.remove();
  
  saveBtn.onclick = () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) {
      alert(I18n.getMessage('alertFillTitleContent') || '请填写标题和内容');
      return;
    }

    const placeholders = [...content.matchAll(/\{\{(.+?)\}\}/g)].map(m => m[1]);

    chrome.storage.local.get(['prompts'], (result) => {
      let prompts = result.prompts || [];
      prompts.push({ 
        id: Date.now().toString(), 
        title, 
        content, 
        placeholders, 
        enabled: true 
      });

      chrome.storage.local.set({ prompts }, () => {
        backdrop.remove();
        showNotification(I18n.getMessage('alertAdded') || '添加成功');
      });
    });
  };

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  
  setTimeout(() => titleInput.focus(), 100);
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'ai-helper-notification';
  notification.innerText = message;
  document.body.appendChild(notification);

  // Trigger reflow
  notification.offsetHeight;
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

function showPlaceholderModal(prompt) {
  // Clean up any existing modal
  const existingBackdrop = document.querySelector('.ai-helper-backdrop');
  if (existingBackdrop) existingBackdrop.remove();

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
    input.className = 'ai-helper-input'; // Unified class
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
  window.aiHelperInitialize = initialize;
}

if (window.aiHelperInitialize) {
  window.aiHelperInitialize();
}