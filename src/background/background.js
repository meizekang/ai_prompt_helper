const defaultPrompts = [
  {
    id: '1',
    title: '翻译为中文',
    content: '请将以下内容翻译为中文：{{text}}',
    placeholders: ['text']
  },
  {
    id: '2',
    title: '代码解释',
    content: '请解释这段{{language}}代码：{{code}}',
    placeholders: ['language', 'code']
  },
  {
    id: '3',
    title: '总结文章',
    content: '请总结这篇文章的核心观点：{{article}}',
    placeholders: ['article']
  }
];

const defaultSettings = {
  globalEnabled: true,
  autoSavePromptOnEnter: true,
  domains: [
    { id: 1, url: 'chatgpt.com', enabled: true },
    { id: 2, url: 'claude.ai', enabled: true },
    { id: 3, url: 'gemini.google.com', enabled: true },
    { id: 4, url: 'poe.com', enabled: true },
    { id: 5, url: 'deepseek.com', enabled: true },
    { id: 6, url: 'copilot.microsoft.com', enabled: true },
    { id: 7, url: 'perplexity.ai', enabled: true },
    { id: 8, url: 'chat.mistral.ai', enabled: true },
    { id: 9, url: 'doubao.com', enabled: true },
    { id: 10, url: 'kimi.moonshot.cn', enabled: true },
    { id: 11, url: 'tongyi.aliyun.com', enabled: true },
    { id: 12, url: 'yiyan.baidu.com', enabled: true },
    { id: 13, url: 'hunyuan.tencent.com', enabled: true },
    { id: 14, url: 'chatglm.cn', enabled: true },
    { id: 15, url: 'hailuoai.com', enabled: true }
  ]
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['prompts', 'settings'], (result) => {
    if (!result.prompts) {
      chrome.storage.local.set({ prompts: defaultPrompts });
    }
    if (!result.settings) {
      chrome.storage.local.set({ settings: defaultSettings });
    }
  });

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "save-prompt",
      title: chrome.i18n.getMessage("saveAsPrompt"),
      contexts: ["selection"]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-prompt" && tab && tab.id) {
    const sendMessage = (retry = true) => {
      chrome.tabs.sendMessage(tab.id, {
        action: "open_save_prompt_modal",
        text: info.selectionText
      }, () => {
        if (chrome.runtime.lastError) {
          if (retry) {
            // Content script might be missing. Inject it and try again.
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['src/utils/i18n.js', 'src/content/content.js']
            }, () => {
              if (chrome.runtime.lastError) return;
              
              chrome.scripting.insertCSS({
                target: { tabId: tab.id },
                files: ['src/content/content.css']
              }, () => {
                sendMessage(false);
              });
            });
          }
        }
      });
    };
    
    sendMessage();
  }
});
