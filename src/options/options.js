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
  
  // Dynamic button text based on edit mode
  updateButtonText();
}

function updateButtonText() {
    const isEdit = document.getElementById('editPromptId').value !== '';
    const btn = document.getElementById('addPrompt');
    if(btn) {
        if(isEdit) {
           btn.textContent = I18n.getMessage('updatePromptBtn') || '更新提示词';
        } else {
           btn.textContent = I18n.getMessage('addPromptBtn');
        }
    }
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
    
    if (prompts.length === 0) {
      promptList.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📝</span>
          <div>${I18n.getMessage('emptyPrompts')}</div>
        </div>`;
    } else {
      prompts.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
          <div class="item-info">
            <span class="item-title">${p.title}</span>
            <span class="item-desc">${p.content.substring(0, 80)}${p.content.length > 80 ? '...' : ''}</span>
          </div>
          <div style="display:flex; gap:8px;">
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
    }
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

// Add/Update Prompt
document.getElementById('addPrompt').addEventListener('click', () => {
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
        resetEditMode();
    } else {
        // Add new
        prompts.push({ id: Date.now().toString(), title, content, placeholders });
        // Clear inputs only on add
        document.getElementById('newTitle').value = '';
        document.getElementById('newContent').value = '';
    }

    chrome.storage.local.set({ prompts }, () => {
      loadPrompts();
    });
  });
});

function resetEditMode() {
    document.getElementById('editPromptId').value = '';
    document.getElementById('newTitle').value = '';
    document.getElementById('newContent').value = '';
    document.getElementById('cancelEdit').style.display = 'none';
    document.getElementById('formTitleLabel').textContent = I18n.getMessage('newPromptLabel');
    updateButtonText();
}

// Cancel Edit
document.getElementById('cancelEdit').addEventListener('click', resetEditMode);

// Handle Edit & Delete in List
document.getElementById('promptList').addEventListener('click', (e) => {
  const delBtn = e.target.closest('.delete-prompt');
  const editBtn = e.target.closest('.edit-prompt');

  if (delBtn) {
    if(confirm(I18n.getMessage('confirmDeletePrompt'))) {
      const index = parseInt(delBtn.dataset.index);
      chrome.storage.local.get(['prompts'], (result) => {
        const prompts = result.prompts || [];
        // Check if we are editing this one
        const deletedId = prompts[index].id;
        if(document.getElementById('editPromptId').value === deletedId) {
            resetEditMode();
        }
        
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
            
            // Show cancel button and scroll to top
            document.getElementById('cancelEdit').style.display = 'inline-block';
            document.getElementById('formTitleLabel').textContent = I18n.getMessage('editPrompt') || '编辑提示词';
            updateButtonText();
            document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
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

// Language Switch
document.getElementById('languageSelect').addEventListener('change', (e) => {
  const newLang = e.target.value;
  
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || { domains: [] };
    settings.language = newLang;
    chrome.storage.local.set({ settings }, () => {
      I18n.setLocale(newLang);
      updatePageText();
      loadPrompts();
      loadSettings();
    });
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
