# AI Prompt Helper

[简体中文](./README_zh.md) | [English](./README.md)

AI Prompt Helper 是一款功能强大的浏览器扩展，旨在优化您的 AI 工作流。它可以帮助您管理、组织并快速插入带有智能匹配和动态占位符的提示词（Prompts）。

## ✨ 功能特性

- **提示词库管理**：轻松添加、编辑和删除常用的 AI 提示词。
- **动态占位符**：支持 `{{text}}` 等占位符，插入时自动替换为选中文本或手动输入内容。
- **智能匹配**：在支持的站点（如 ChatGPT, Claude 等）输入框中通过关键词快速唤起提示词。
- **站点管理**：自定义允许运行扩展的域名，保护隐私。
- **导入导出**：支持 JSON 格式的提示词库备份与迁移。
- **多语言支持**：内置中英文界面。

## 🚀 如何使用

### 安装开发版
1. 下载本项目代码到本地。
2. 打开 Chrome 浏览器（或 Edge, Brave 等 Chromium 内核浏览器）。
3. 进入 `chrome://extensions/`（扩展程序管理）。
4. 开启右上角的 **"开发者模式"**。
5. 点击 **"加载已解压的扩展程序"**，选择项目中的 `helper_code` 文件夹。

### 快速上手
1. 点击浏览器工具栏中的扩展图标，进入 **"管理提示词与设置"**。
2. 在提示词库中添加您的第一个提示词，例如：
   - **标题**: `翻译成英文`
   - **内容**: `请将以下内容翻译成地道的英文：{{text}}`
3. 在设置中添加您常用的 AI 网站域名（如 `chatgpt.com`）。
4. 在对应的网站输入框中输入关键词，即可看到匹配的提示词建议。

## 📦 如何打包

由于本项目采用原生 JavaScript 开发，无需复杂的构建步骤，直接压缩 `helper_code` 目录即可：

1. 进入 `helper_code` 目录。
2. 将该目录下的所有文件和子文件夹（`_locales`, `icons`, `src`, `manifest.json`）压缩为 `zip` 格式。
3. 确保 `manifest.json` 位于压缩包的根目录。

## 🚢 如何发布

### 发布到 Chrome 应用商店
1. 访问 [Chrome 应用商店开发者控制台](https://chrome.google.com/webstore/devconsole/)。
2. 支付一次性的开发者注册费用（如果尚未支付）。
3. 点击 **"添加新项"**。
4. 上传您打包好的 `zip` 文件。
5. 填写扩展程序的详细信息（说明、截图、图标等）。
6. 提交审核。

### 发布到 Edge 加载项商店
1. 访问 [Microsoft Edge 合作伙伴中心](https://partner.microsoft.com/dashboard/microsoftedge/public/login)。
2. 注册为开发者。
3. 创建新产品并上传 `zip` 包。
4. 完善商店信息并提交。

## 📄 开源协议

本项目采用 [MIT License](./LICENSE) 协议开源。欢迎提交 Issue 或 Pull Request 来改进本项目！
