if (!window.I18n) {
  var I18nData = {
  "en": {
    "extName": "AI Prompt Helper",
    "extDesc": "A Chrome extension to help manage and insert AI prompts with placeholders.",
    "optionsTitle": "AI Prompt Helper - Settings",
    "sidebarHeader": "Prompt Helper",
    "navPrompts": "Prompt Library",
    "navSettings": "Preferences",
    "promptsTitle": "Prompt Library",
    "promptsSubtitle": "Manage your favorite prompts for quick access.",
    "newPromptLabel": "New Prompt",
    "promptTitlePlaceholder": "Title (e.g. Translate to English)",
    "promptContentPlaceholder": "Content... Use {{text}} for selected text placeholder",
    "addPromptBtn": "Add to Library",
    "myPromptsTitle": "My Favorites",
    "emptyPrompts": "No prompts yet. Add one above.",
    "settingsTitle": "Preferences",
    "settingsSubtitle": "Manage extension scope and global settings.",
    "globalEnableLabel": "Global Enable",
    "globalEnableDesc": "Toggle all extension features",
    "languageLabel": "Language",
    "languageDesc": "Choose your preferred language",
    "siteManagementTitle": "Site Management",
    "addSiteLabel": "Add Allowed Site",
    "domainPlaceholder": "Enter domain (e.g. chatgpt.com)",
    "addSiteBtn": "Add",
    "addSiteHint": "Show prompt helper only on whitelisted sites.",
    "configuredSitesTitle": "Configured Sites",
    "emptySites": "No sites configured.",
    "alertFillTitleContent": "Please fill in title and content.",
    "alertAdded": "Added successfully.",
    "confirmDeletePrompt": "Are you sure you want to delete this prompt?",
    "alertDomainExists": "Domain already exists.",
    "confirmDeleteDomain": "Are you sure you want to delete this domain?",
    "overlayHeader": "Prompt Match",
    "modalCancel": "Cancel",
    "modalConfirm": "Confirm and Insert",
    "modalInputPlaceholder": "Enter value for",
    "updatePromptBtn": "Update Prompt",
    "cancelEditBtn": "Cancel",
    "editPrompt": "Edit Prompt",
    "popupUsage1": "Type keywords in input box on enabled sites",
    "popupUsage2": "Select a prompt template from the popup",
    "popupUsage3": "Auto-fill and replace placeholders",
    "managePromptsBtn": "Manage Prompts & Settings",
    "popupSubtitle": "Your smart writing assistant",
    "disableSite": "Disable for this site (enable in settings)",
    "saveAsPrompt": "Save as Prompt",
    "autoSavePromptTitle": "Auto Save Prompt on Enter",
    "autoSavePromptDesc": "Ask to save prompt when pressing Enter in input boxes",
    "savePromptConfirm": "Do you want to save this as a prompt?"
  },
  "zh_CN": {
    "extName": "AI 提示词助手",
    "extDesc": "一个帮助管理和插入带占位符的 AI 提示词的 Chrome 扩展。",
    "optionsTitle": "AI 提示词助手 - 设置",
    "sidebarHeader": "提示词助手",
    "navPrompts": "提示词库",
    "navSettings": "偏好设置",
    "promptsTitle": "提示词库",
    "promptsSubtitle": "管理您的常用提示词，随时快速调用。",
    "newPromptLabel": "新建提示词",
    "promptTitlePlaceholder": "标题（例如：翻译为英文）",
    "promptContentPlaceholder": "输入提示词内容... 使用 {{text}} 作为选中文本占位符",
    "addPromptBtn": "添加至库",
    "myPromptsTitle": "我的收藏",
    "emptyPrompts": "暂无提示词，请在上方添加",
    "settingsTitle": "偏好设置",
    "settingsSubtitle": "管理扩展的生效范围和全局开关。",
    "globalEnableLabel": "全局启用",
    "globalEnableDesc": "一键开启或关闭扩展的所有功能",
    "languageLabel": "界面语言",
    "languageDesc": "选择您偏好的显示语言",
    "siteManagementTitle": "网站管理",
    "addSiteLabel": "添加生效网站",
    "domainPlaceholder": "输入域名 (例如: chatgpt.com)",
    "addSiteBtn": "添加",
    "addSiteHint": "仅在白名单列表中的网站显示提示词助手弹窗。",
    "configuredSitesTitle": "已配置网站",
    "emptySites": "暂无配置网站",
    "alertFillTitleContent": "请填写标题和内容",
    "alertAdded": "添加成功",
    "confirmDeletePrompt": "确定要删除这个提示词吗？",
    "alertDomainExists": "该域名已存在",
    "confirmDeleteDomain": "确定要删除这个域名吗？",
    "overlayHeader": "提示词匹配",
    "modalCancel": "取消",
    "modalConfirm": "确定并插入",
    "modalInputPlaceholder": "请输入",
    "updatePromptBtn": "更新提示词",
    "cancelEditBtn": "取消编辑",
    "editPrompt": "编辑提示词",
    "popupUsage1": "在已配置的网站输入框中输入关键词",
    "popupUsage2": "选择弹出的提示词模板",
    "popupUsage3": "自动填充并替换占位符",
    "managePromptsBtn": "管理提示词 & 设置",
    "popupSubtitle": "您的智能写作助手",
    "disableSite": "在此网站禁用，后续请在管理页面开启",
    "saveAsPrompt": "保存为提示词",
    "autoSavePromptTitle": "回车自动保存提示词",
    "autoSavePromptDesc": "在输入框按下回车键时询问是否保存提示词",
    "savePromptConfirm": "是否将此内容保存为提示词？"
  }
};

class I18nManager {
  constructor() {
    this.locale = 'zh_CN'; // Default
    this.listeners = [];
  }

  async init() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['settings'], (result) => {
        const settings = result.settings || {};
        if (settings.language) {
          this.locale = settings.language;
        } else {
          // Detect browser language
          const browserLang = navigator.language.replace('-', '_');
          if (browserLang.startsWith('zh')) {
            this.locale = 'zh_CN';
          } else {
            this.locale = 'en'; // Default fallback
          }
        }
        resolve();
      });
    });
  }

  setLocale(locale) {
    if (I18nData[locale]) {
      this.locale = locale;
      // Notify listeners if any (simple implementation)
      this.listeners.forEach(cb => cb(locale));
    }
  }

  getMessage(key) {
    const dict = I18nData[this.locale] || I18nData['en'];
    return dict[key] || key;
  }
}

// Global instance
  var I18n = new I18nManager();
  window.I18n = I18n;
}
