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
          <div>暂无提示词，请在上方添加</div>
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
          <button class="btn btn-icon delete-prompt" data-index="${index}" title="删除">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
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

    // Migration logic (keep for backward compatibility)
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
          <div>暂无配置网站</div>
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
            <button class="btn btn-icon delete-domain" data-index="${index}" title="删除">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        `;
        domainList.appendChild(div);
      });
    }
  });
}

// Add Prompt
document.getElementById('addPrompt').addEventListener('click', () => {
  const title = document.getElementById('newTitle').value;
  const content = document.getElementById('newContent').value;
  if (!title || !content) {
    alert('请填写标题和内容');
    return;
  }

  const placeholders = [...content.matchAll(/\{\{(.+?)\}\}/g)].map(m => m[1]);
  
  chrome.storage.local.get(['prompts'], (result) => {
    const prompts = result.prompts || [];
    prompts.push({ id: Date.now().toString(), title, content, placeholders });
    chrome.storage.local.set({ prompts }, () => {
      document.getElementById('newTitle').value = '';
      document.getElementById('newContent').value = '';
      loadPrompts();
    });
  });
});

// Delete Prompt
document.getElementById('promptList').addEventListener('click', (e) => {
  const btn = e.target.closest('.delete-prompt');
  if (btn) {
    if(confirm('确定要删除这个提示词吗？')) {
      const index = parseInt(btn.dataset.index);
      chrome.storage.local.get(['prompts'], (result) => {
        const prompts = result.prompts || [];
        prompts.splice(index, 1);
        chrome.storage.local.set({ prompts }, loadPrompts);
      });
    }
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
      alert('该域名已存在');
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
    if(confirm('确定要删除这个域名吗？')) {
      chrome.storage.local.get(['settings'], (result) => {
        const settings = result.settings || { domains: [] };
        settings.domains.splice(index, 1);
        chrome.storage.local.set({ settings }, loadSettings);
      });
    }
  }
});

// Initial load
loadPrompts();
loadSettings();
