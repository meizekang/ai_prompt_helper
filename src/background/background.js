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
  enabledDomains: [
    'chatgpt.com',
    'claude.ai',
    'gemini.google.com',
    'poe.com',
    'deepseek.com'
  ],
  disabledDomains: []
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
});
