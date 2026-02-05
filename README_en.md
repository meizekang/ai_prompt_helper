# AI Prompt Helper

[简体中文](./README.md) | [English](./README_en.md)

AI Prompt Helper is a powerful browser extension designed to boost your AI workflow. It helps you manage, organize, and instantly insert prompts with smart matching and dynamic placeholders.

## ✨ Features

- **Prompt Library**: Easily add, edit, and delete your favorite AI prompts.
- **Dynamic Placeholders**: Supports `{{text}}` and other placeholders, automatically replaced with selected text or manual input.
- **Smart Matching**: Quickly trigger prompt suggestions in input boxes on supported sites (like ChatGPT, Claude, etc.).
- **Site Management**: Customize whitelisted domains where the extension should run.
- **Import/Export**: Backup and migrate your prompt library via JSON files.
- **I18n Support**: Built-in English and Chinese interfaces.

## 🚀 How to Use

### Install Development Version
1. Download the source code to your local machine.
2. Open Chrome (or Edge, Brave, and other Chromium-based browsers).
3. Go to `chrome://extensions/`.
4. Enable **"Developer mode"** in the top right corner.
5. Click **"Load unpacked"** and select the `helper_code` folder from this project.

### Quick Start
1. Click the extension icon in the toolbar and select **"Manage Prompts & Settings"**.
2. Add your first prompt in the library, for example:
   - **Title**: `Translate to English`
   - **Content**: `Please translate the following text into idiomatic English: {{text}}`
3. Add your frequently used AI domains (e.g., `chatgpt.com`) in the Settings.
4. Type keywords in the input box of the configured sites to see prompt suggestions.

## 📦 How to Build

Since this project is developed with vanilla JavaScript, no complex build steps are required. Simply compress the `helper_code` directory:

1. Navigate to the `helper_code` directory.
2. Compress all files and subfolders (`_locales`, `icons`, `src`, `manifest.json`) into a `zip` file.
3. Ensure `manifest.json` is at the root of the zip archive.

## 🚢 How to Publish

### Publish to Chrome Web Store
1. Visit the [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole/).
2. Pay the one-time developer registration fee (if not already done).
3. Click **"Add new item"**.
4. Upload your packaged `zip` file.
5. Fill in the extension details (description, screenshots, icons, etc.).
6. Submit for review.

### Publish to Microsoft Edge Add-ons
1. Visit the [Microsoft Edge Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/public/login).
2. Register as a developer.
3. Create a new submission and upload your `zip` file.
4. Complete the store listing and submit.

## 📄 License

This project is licensed under the [MIT License](./LICENSE). Contributions via Issues or Pull Requests are welcome!
