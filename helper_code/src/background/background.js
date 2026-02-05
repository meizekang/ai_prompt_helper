const defaultPrompts = [
  {
    id: '1',
    title: '💡 使用说明 (必读)',
    content: '欢迎使用 AI 提示词助手！\n\n1. 如何配置：在设置页面的“提示词库”中点击“新建提示词”。\n2. 占位符：使用 {{text}} 代表选中的文本。例如：\"请翻译：{{text}}\"。\n3. 快速调用：在支持的 AI 网站输入框中，输入与提示词标题匹配的文字，或直接点击弹出的悬浮按钮。\n4. 自定义变量：你可以使用任何双大括号包裹的词，如 {{language}}，插件会提示你输入具体内容。\n\n当前选中的文本是：{{text}}',
    placeholders: ['text']
  },
  {
    id: '2',
    title: '💡 Usage Guide (Read Me)',
    content: 'Welcome to AI Prompt Helper!\n\n1. How to configure: Click "New Prompt" in the "Prompt Library" on the settings page.\n2. Placeholders: Use {{text}} to represent your selected text. E.g., "Please translate: {{text}}".\n3. Quick Access: On supported AI sites, type words matching the prompt title or click the floating button.\n4. Custom Variables: You can use any word in double braces, like {{language}}, and the extension will ask for input.\n\nYour current selection is: {{text}}',
    placeholders: ['text']
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
    { id: 15, url: 'hailuoai.com', enabled: true },
    { id: 16, url: 'qianwen.com', enabled: true }
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
