// Localization
async function localize() {
  await I18n.init(); // Initialize I18n first
  
  // Set dropdown value
  const langSelect = document.getElementById('languageSelect');
  if (langSelect) {
    langSelect.value = I18n.locale;
  }

  updatePageText();
}

function updatePageText() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = I18n.getMessage(key);
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = I18n.getMessage(key);
  });
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    // Update menu state
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');

    // Update content visibility
    const targetId = item.dataset.target;
    document.querySelectorAll('.page-section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(`section-${targetId}`).classList.add('active');
  });
});

function loadPrompts() {
  chrome.storage.local.get(['prompts'], (result) => {
    const promptList = document.getElementById('promptList');
    promptList.innerHTML = '';
    const prompts = result.prompts || [];
    
    // Update stats
    const total = prompts.length;
    const enabled = prompts.filter(p => p.enabled !== false).length;
    const statsEl = document.getElementById('promptStats');
    if (statsEl) {
      statsEl.textContent = `(${enabled}/${total})`;
      statsEl.title = `${I18n.getMessage('statsTitle') || 'Enabled / Total'}`;
    }

    if (prompts.length === 0) {
      promptList.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-secondary); opacity: 0.5;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </span>
          <div>${I18n.getMessage('emptyPrompts')}</div>
        </div>`;
    } else {
      prompts.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.dataset.index = index; // Store index for event handling

        div.innerHTML = `
          <div class="item-info">
            <span class="item-title">${p.title}</span>
            <span class="item-desc">${p.content.substring(0, 80)}${p.content.length > 80 ? '...' : ''}</span>
          </div>
          <div style="display:flex; gap:8px; align-items: center;">
            <label class="switch" style="transform: scale(0.8); margin-right: 4px;">
              <input type="checkbox" class="prompt-toggle" data-index="${index}" ${p.enabled !== false ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
            <button class="btn btn-icon edit-prompt" data-index="${index}" title="${I18n.getMessage('editPrompt') || '编辑'}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn btn-icon delete-prompt" data-index="${index}" title="${I18n.getMessage('modalCancel')}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        `;
        promptList.appendChild(div);
      });
      
      // Re-attach listeners to new list items
      attachTooltipListeners();
    }
  });
}

// Tooltip Logic
let tooltipTimer = null;
const tooltipEl = document.createElement('div');
tooltipEl.className = 'custom-tooltip';
document.body.appendChild(tooltipEl);

tooltipEl.addEventListener('mouseenter', () => {
  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }
});

tooltipEl.addEventListener('mouseleave', () => {
  tooltipTimer = setTimeout(() => {
    tooltipEl.classList.remove('active');
  }, 200);
});

function attachTooltipListeners() {
  const items = document.querySelectorAll('.list-item .item-info');
  
  items.forEach(item => {
    item.addEventListener('mouseenter', (e) => {
      // Clear any pending hide timer
      if (tooltipTimer) {
        clearTimeout(tooltipTimer);
        tooltipTimer = null;
      }
      
      const listItem = item.closest('.list-item');
      if (!listItem) return;
      
      const index = parseInt(listItem.dataset.index);
      
      chrome.storage.local.get(['prompts'], (result) => {
        const prompts = result.prompts || [];
        const p = prompts[index];
        
        if (p) {
          // Set content
          tooltipEl.innerHTML = `
            <span class="custom-tooltip-title">${p.title.replace(/</g, "&lt;")}</span>
            <span class="custom-tooltip-content">${p.content.replace(/</g, "&lt;")}</span>
          `;
          
          // Position and show
          const rect = item.getBoundingClientRect();
          // Prefer bottom, if not enough space flip to top? For now just bottom-left aligned
          // Or align to the right of the item if side-bar
          // Let's float it below the title
          
          let top = rect.bottom + 5;
          let left = rect.left;
          
          // Check bounds
          tooltipEl.style.display = 'block'; // Ensure it has dim to measure
          tooltipEl.classList.add('active'); // Visually show
          
          const tooltipRect = tooltipEl.getBoundingClientRect();
          if (top + tooltipRect.height > window.innerHeight) {
            top = rect.top - tooltipRect.height - 5;
          }

          // Check right edge
          if (left + tooltipRect.width > window.innerWidth) {
             left = window.innerWidth - tooltipRect.width - 20; // 20px padding from edge
          }
          
          tooltipEl.style.top = `${top}px`;
          tooltipEl.style.left = `${left}px`;
        }
      });
    });

    item.addEventListener('mouseleave', () => {
       tooltipTimer = setTimeout(() => {
         tooltipEl.classList.remove('active');
       }, 300); // 300ms delay to allow moving to tooltip
    });
  });
}

function loadSettings() {
  chrome.storage.local.get(['settings'], (result) => {
    // Initialize default settings if needed
    let settings = result.settings || {
      globalEnabled: true,
      domains: []
    };

    // Migration logic
    if (Array.isArray(settings.enabledDomains)) {
      const oldDomains = settings.enabledDomains;
      oldDomains.forEach(domainStr => {
        if (!settings.domains) settings.domains = [];
        if (!settings.domains.some(d => d.url === domainStr)) {
          settings.domains.push({
            id: Date.now() + Math.random(),
            url: domainStr,
            enabled: true
          });
        }
      });
      delete settings.enabledDomains;
      chrome.storage.local.set({ settings });
    }

    // Render Global Switch
    const globalSwitch = document.getElementById('globalSwitch');
    globalSwitch.checked = settings.globalEnabled !== false;

    // Render Auto Save Prompt Switch
    const autoSavePromptSwitch = document.getElementById('autoSavePromptSwitch');
    if (autoSavePromptSwitch) {
      // Default to true if undefined
      autoSavePromptSwitch.checked = settings.autoSavePromptOnEnter !== false;
    }

    // Render Domain List
    const domainList = document.getElementById('domainList');
    domainList.innerHTML = '';
    
    if (!settings.domains || settings.domains.length === 0) {
      domainList.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🌐</span>
          <div>${I18n.getMessage('emptySites')}</div>
        </div>`;
    } else {
      settings.domains.forEach((domain, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
          <div class="item-info" style="display: flex; align-items: center; gap: 12px;">
            <div style="background: var(--bg-hover); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">
              ${domain.url.charAt(0).toUpperCase()}
            </div>
            <div>
              <span class="item-title" style="margin-bottom: 0;">${domain.url}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <label class="switch" style="transform: scale(0.8);">
              <input type="checkbox" class="domain-toggle" data-index="${index}" ${domain.enabled ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
            <button class="btn btn-icon delete-domain" data-index="${index}" title="${I18n.getMessage('modalCancel')}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        `;
        domainList.appendChild(div);
      });
    }
  });
}

// Modal Logic
const modal = document.getElementById('promptModal');
const modalTitle = document.getElementById('modalTitle');
const saveBtn = document.getElementById('savePromptBtn');

function openModal(isEdit = false) {
    modal.classList.add('active');
    if (isEdit) {
        modalTitle.textContent = I18n.getMessage('editPrompt') || '编辑提示词';
        saveBtn.textContent = I18n.getMessage('updatePromptBtn') || '更新';
    } else {
        modalTitle.textContent = I18n.getMessage('newPromptLabel') || '新建提示词';
        saveBtn.textContent = I18n.getMessage('addPromptBtn') || '添加';
        // Clear fields for new prompt
        document.getElementById('editPromptId').value = '';
        document.getElementById('newTitle').value = '';
        document.getElementById('newContent').value = '';
    }
}

function closeModal() {
    modal.classList.remove('active');
}

// Bind Modal Events
document.getElementById('openAddModalBtn').addEventListener('click', () => openModal(false));
document.getElementById('closeModalTop').addEventListener('click', closeModal);
document.getElementById('cancelModalBtn').addEventListener('click', closeModal);

// Close on click outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Save Prompt
saveBtn.addEventListener('click', () => {
  const title = document.getElementById('newTitle').value;
  const content = document.getElementById('newContent').value;
  const editId = document.getElementById('editPromptId').value;
  
  if (!title || !content) {
    alert(I18n.getMessage('alertFillTitleContent'));
    return;
  }

  const placeholders = [...content.matchAll(/\{\{(.+?)\}\}/g)].map(m => m[1]);
  
  chrome.storage.local.get(['prompts'], (result) => {
    let prompts = result.prompts || [];
    
    if (editId) {
        // Update existing
        const index = prompts.findIndex(p => p.id === editId);
        if (index !== -1) {
            prompts[index] = { ...prompts[index], title, content, placeholders };
        }
    } else {
        // Add new
        prompts.push({ id: Date.now().toString(), title, content, placeholders, enabled: true });
    }

    chrome.storage.local.set({ prompts }, () => {
      loadPrompts();
      closeModal();
    });
  });
});

// Handle Edit & Delete in List
document.getElementById('promptList').addEventListener('click', (e) => {
  // Handle Toggle
  if (e.target.classList.contains('prompt-toggle')) {
    const index = parseInt(e.target.dataset.index);
    const isEnabled = e.target.checked;
    
    chrome.storage.local.get(['prompts'], (result) => {
      const prompts = result.prompts || [];
      if (prompts[index]) {
        prompts[index].enabled = isEnabled;
        chrome.storage.local.set({ prompts }, loadPrompts);
      }
    });
    return;
  }

  const delBtn = e.target.closest('.delete-prompt');
  const editBtn = e.target.closest('.edit-prompt');

  if (delBtn) {
    if(confirm(I18n.getMessage('confirmDeletePrompt'))) {
      const index = parseInt(delBtn.dataset.index);
      chrome.storage.local.get(['prompts'], (result) => {
        const prompts = result.prompts || [];
        prompts.splice(index, 1);
        chrome.storage.local.set({ prompts }, loadPrompts);
      });
    }
    return;
  }

  if (editBtn) {
    const index = parseInt(editBtn.dataset.index);
    chrome.storage.local.get(['prompts'], (result) => {
        const prompts = result.prompts || [];
        const prompt = prompts[index];
        if (prompt) {
            document.getElementById('newTitle').value = prompt.title;
            document.getElementById('newContent').value = prompt.content;
            document.getElementById('editPromptId').value = prompt.id;
            openModal(true);
        }
    });
  }
});

// Add Domain
document.getElementById('addDomain').addEventListener('click', () => {
  const domainInput = document.getElementById('newDomain');
  let url = domainInput.value.trim();
  
  // Basic url cleanup
  url = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (!url) return;

  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || { globalEnabled: true, domains: [] };
    if (!settings.domains) settings.domains = [];
    
    // Check duplicates
    if (settings.domains.some(d => d.url === url)) {
      alert(I18n.getMessage('alertDomainExists'));
      return;
    }

    settings.domains.push({
      id: Date.now(),
      url: url,
      enabled: true
    });

    chrome.storage.local.set({ settings }, () => {
      domainInput.value = '';
      loadSettings();
    });
  });
});

// Global Switch Toggle
document.getElementById('globalSwitch').addEventListener('change', (e) => {
  const isEnabled = e.target.checked;
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || { domains: [] };
    settings.globalEnabled = isEnabled;
    chrome.storage.local.set({ settings });
  });
});

// Auto Save Prompt Switch Toggle
const autoSavePromptSwitch = document.getElementById('autoSavePromptSwitch');
if (autoSavePromptSwitch) {
  autoSavePromptSwitch.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.local.get(['settings'], (result) => {
      const settings = result.settings || { domains: [] };
      settings.autoSavePromptOnEnter = isEnabled;
      chrome.storage.local.set({ settings });
    });
  });
}

// Language Switch
document.getElementById('languageSelect').addEventListener('change', (e) => {
  const newLang = e.target.value;
  
  chrome.storage.local.get(['settings', 'prompts'], (result) => {
    const settings = result.settings || { domains: [] };
    let prompts = result.prompts || [];
    settings.language = newLang;

    // Check if the default prompt (id: '1') exists
    const defaultPromptIndex = prompts.findIndex(p => p.id === '1');
    if (defaultPromptIndex !== -1) {
      // It exists, so we update it to the new language's version
      // We need the data from background.js, but since we can't easily import it here,
      // we'll send a message to background.js or just use a local copy of the data if it's small.
      // Alternatively, we can request it from background.js.
      chrome.runtime.sendMessage({ action: "get_default_prompts", locale: newLang }, (response) => {
        if (response && response.prompts) {
          const newDefaultPrompt = response.prompts.find(p => p.id === '1');
          if (newDefaultPrompt) {
            prompts[defaultPromptIndex] = { 
              ...prompts[defaultPromptIndex], 
              title: newDefaultPrompt.title,
              content: newDefaultPrompt.content,
              placeholders: newDefaultPrompt.placeholders
            };
            chrome.storage.local.set({ settings, prompts }, () => {
              I18n.setLocale(newLang);
              updatePageText();
              loadPrompts();
              loadSettings();
            });
          }
        } else {
          // Fallback if message fails
          chrome.storage.local.set({ settings }, () => {
            I18n.setLocale(newLang);
            updatePageText();
            loadPrompts();
            loadSettings();
          });
        }
      });
    } else {
      // User deleted the default prompt, so we don't replace it.
      chrome.storage.local.set({ settings }, () => {
        I18n.setLocale(newLang);
        updatePageText();
        loadPrompts();
        loadSettings();
      });
    }
  });
});

// Domain List Actions (Toggle & Delete)
document.getElementById('domainList').addEventListener('click', (e) => {
  // Handle Toggle
  if (e.target.classList.contains('domain-toggle')) {
    const index = parseInt(e.target.dataset.index);
    const isEnabled = e.target.checked;
    
    chrome.storage.local.get(['settings'], (result) => {
      const settings = result.settings || { domains: [] };
      if (settings.domains[index]) {
        settings.domains[index].enabled = isEnabled;
        chrome.storage.local.set({ settings });
      }
    });
    return;
  }

  // Handle Delete
  const delBtn = e.target.closest('.delete-domain');
  if (delBtn) {
    const index = parseInt(delBtn.dataset.index);
    if(confirm(I18n.getMessage('confirmDeleteDomain'))) {
      chrome.storage.local.get(['settings'], (result) => {
        const settings = result.settings || { domains: [] };
        settings.domains.splice(index, 1);
        chrome.storage.local.set({ settings }, loadSettings);
      });
    }
  }
});

// Initial load
localize().then(() => {
  loadPrompts();
  loadSettings();
});

// Export Prompts
document.getElementById('exportPromptsBtn').addEventListener('click', () => {
  chrome.storage.local.get(['prompts'], (result) => {
    const prompts = result.prompts || [];
    // Only export essential fields to keep it clean
    const exportData = prompts.map(({ title, content }) => ({ title, content }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-prompts-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
});

// Import Prompts
const importFileInput = document.getElementById('importFileInput');
document.getElementById('importPromptsBtn').addEventListener('click', () => {
  importFileInput.click();
});

importFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedData = JSON.parse(event.target.result);
      
      // Validation
      if (!Array.isArray(importedData) || !importedData.every(p => p.title && p.content)) {
        throw new Error('Invalid format');
      }

      chrome.storage.local.get(['prompts'], (result) => {
        let prompts = result.prompts || [];
        
        const newPrompts = importedData.map(p => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          title: p.title,
          content: p.content,
          placeholders: [...p.content.matchAll(/\{\{(.+?)\}\}/g)].map(m => m[1]),
          enabled: true
        }));

        prompts = [...prompts, ...newPrompts];
        chrome.storage.local.set({ prompts }, () => {
          loadPrompts();
          const msg = I18n.getMessage('importSuccess');
          alert(msg.includes('导入') ? `成功导入 ${newPrompts.length} 条提示词` : `Successfully imported ${newPrompts.length} prompts`);
          importFileInput.value = ''; // Reset
        });
      });
    } catch (err) {
      alert(I18n.getMessage('importFormatError') + '\n\n' + I18n.getMessage('importTemplateHint'));
      importFileInput.value = ''; // Reset
    }
  };
  reader.readAsText(file);
});
