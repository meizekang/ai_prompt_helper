const defaultPromptsData = {
  "zh_CN": [
    {
      id: '1',
      title: '💡 使用说明 (必读)',
      content: '欢迎使用 AI 提示词助手！\n\n1. 如何配置：在设置页面的“提示词库”中点击“新建提示词”。\n2. 占位符：使用 {{text}} 代表选中的文本。例如：\"请翻译：{{text}}\"。\n3. 快速调用：在支持的 AI 网站输入框中，输入与提示词标题匹配的文字，或直接点击弹出的悬浮按钮。\n4. 自定义变量：你可以使用任何双大括号包裹的词，如 {{language}}，插件会提示你输入具体内容。\n\n当前选中的文本是：{{text}}',
      placeholders: ['text']
    }
  ],
  "zh_TW": [
    {
      id: '1',
      title: '💡 使用說明 (必讀)',
      content: '歡迎使用 AI 提示詞助手！\n\n1. 如何配置：在設置頁面的「提示詞庫」中點擊「新建提示詞」。\n2. 佔位符：使用 {{text}} 代表選中的文本。例如：\"請翻譯：{{text}}\"。\n3. 快速調用：在支持的 AI 網站輸入框中，輸入與提示詞標題匹配的文字，或直接點擊彈出的懸浮按鈕。\n4. 自定義變量：你可以使用任何雙大括號包裹的詞，如 {{language}}，插件會提示你輸入具體內容。\n\n當前選中的文本是：{{text}}',
      placeholders: ['text']
    }
  ],
  "en": [
    {
      id: '1',
      title: '💡 Usage Guide (Read Me)',
      content: 'Welcome to AI Prompt Helper!\n\n1. How to configure: Click "New Prompt" in the "Prompt Library" on the settings page.\n2. Placeholders: Use {{text}} to represent your selected text. E.g., "Please translate: {{text}}".\n3. Quick Access: On supported AI sites, type words matching the prompt title or click the floating button.\n4. Custom Variables: You can use any word in double braces, like {{language}}, and the extension will ask for input.\n\nYour current selection is: {{text}}',
      placeholders: ['text']
    }
  ],
  "ko": [
    {
      id: '1',
      title: '💡 사용 설명 (필독)',
      content: 'AI 프롬프트 도우미에 오신 것을 환영합니다!\n\n1. 설정 방법: 설정 페이지의 "프롬프트 라이브러리"에서 "새 프롬프트"를 클릭합니다.\n2. 자리 표시자: 선택한 텍스트를 나타내려면 {{text}}를 사용하세요 (예: "번역해 주세요: {{text}}").\n3. 빠른 호출: 지원되는 AI 사이트 입력창에서 프롬프트 제목과 일치하는 텍스트를 입력하거나 팝업 버튼을 클릭합니다.\n4. 사용자 정의 변수: {{language}}와 같이 이중 중괄호로 감싸인 단어를 사용할 수 있으며, 플러그인이 구체적인 내용 입력을 요청합니다.\n\n현재 선택된 텍스트: {{text}}',
      placeholders: ['text']
    }
  ],
  "de": [
    {
      id: '1',
      title: '💡 Bedienungsanleitung (Bitte lesen)',
      content: 'Willkommen beim AI-Prompt-Assistenten!\n\n1. Konfiguration: Klicken Sie auf der Einstellungsseite unter "Prompt-Bibliothek" auf "Neuer Prompt".\n2. Platzhalter: Verwenden Sie {{text}} für den markierten Text (z. B. "Bitte übersetzen: {{text}}").\n3. Schnellzugriff: Geben Sie auf unterstützten AI-Websites den Titel des Prompts ein oder klicken Sie auf die schwebende Schaltfläche.\n4. Eigene Variablen: Sie können Wörter in doppelten geschweiften Klammern verwenden, wie {{language}}. Die Erweiterung fragt dann nach der Eingabe.\n\nAktuelle Auswahl: {{text}}',
      placeholders: ['text']
    }
  ],
  "fr": [
    {
      id: '1',
      title: '💡 Guide d\'utilisation (À lire)',
      content: 'Bienvenue dans l\'Assistant de Prompts IA !\n\n1. Configuration : Cliquez sur "Nouveau Prompt" dans la "Bibliothèque de Prompts" de la page des paramètres.\n2. Espaces réservés : Utilisez {{text}} pour représenter le texte sélectionné (ex : "Traduire : {{text}}").\n3. Accès rapide : Sur les sites IA compatibles, saisissez le titre du prompt ou cliquez sur le bouton flottant.\n4. Variables personnalisées : Vous pouvez utiliser des mots entre doubles accolades, comme {{language}}, et l\'extension vous demandera de saisir le contenu.\n\nSélection actuelle : {{text}}',
      placeholders: ['text']
    }
  ],
  "es": [
    {
      id: '1',
      title: '💡 Guía de uso (Leer primero)',
      content: '¡Bienvenido al Asistente de Prompts de IA!\n\n1. Configuración: Haz clic en "Nuevo Prompt" en la "Biblioteca de Prompts" de la página de ajustes.\n2. Marcadores: Usa {{text}} para representar el texto seleccionado (ej: "Traducir: {{text}}").\n3. Acceso rápido: En sitios de IA compatibles, escribe el título del prompt o haz clic en el botón flotante.\n4. Variables personalizadas: Puedes usar palabras entre llaves dobles, como {{language}}, y la extensión te pedirá que ingreses el contenido.\n\nSelección actual: {{text}}',
      placeholders: ['text']
    }
  ],
  "it": [
    {
      id: '1',
      title: '💡 Guida all\'uso (Leggere)',
      content: 'Benvenuto nell\'Assistente Prompt IA!\n\n1. Configurazione: Clicca su "Nuovo Prompt" nella "Libreria Prompt" della pagina delle impostazioni.\n2. Segnaposto: Usa {{text}} per rappresentare il testo selezionato (es: "Traduci: {{text}}").\n3. Accesso rapido: Sui siti IA supportati, digita il titolo del prompt o clicca sul pulsante mobile.\n4. Variabili personalizzate: Puoi usare parole tra doppie graffe, come {{language}}, e l\'estensione ti chiederà di inserire il valore.\n\nSelezione attuale: {{text}}',
      placeholders: ['text']
    }
  ],
  "pt": [
    {
      id: '1',
      title: '💡 Guia de Uso (Leia-me)',
      content: 'Bem-vindo ao Assistente de Prompts de IA!\n\n1. Configuração: Clique em "Novo Prompt" na "Biblioteca de Prompts" na página de configurações.\n2. Marcadores: Use {{text}} para representar o texto selecionado (ex: "Traduzir: {{text}}").\n3. Acesso rápido: Em sites de IA suportados, digite o título do prompt ou clique no botão flutuante.\n4. Variáveis personalizadas: Você pode usar palavras entre chaves duplas, como {{language}}, e a extensão solicitará a entrada.\n\nSeleção atual: {{text}}',
      placeholders: ['text']
    }
  ],
  "ru": [
    {
      id: '1',
      title: '💡 Руководство (Прочитать)',
      content: 'Добро пожаловать в Помощник по промптам ИИ!\n\n1. Настройка: Нажмите "Новый промпт" в "Библиотеке промптов" на странице настроек.\n2. Заполнители: Используйте {{text}} для выделенного текста (например: "Переведи: {{text}}").\n3. Быстрый доступ: На поддерживаемых сайтах ИИ введите название промпта или нажмите на плавающую кнопку.\n4. Свои переменные: Можно использовать слова в двойных фигурных скобках, например {{language}}, и расширение попросит ввести значение.\n\nТекущее выделение: {{text}}',
      placeholders: ['text']
    }
  ],
  "hi": [
    {
      id: '1',
      title: '💡 उपयोग मार्गदर्शिका (जरूर पढ़ें)',
      content: 'AI प्रॉम्प्ट सहायक में आपका स्वागत है!\n\n1. कॉन्फ़िगर कैसे करें: सेटिंग्स पेज पर "प्रॉम्प्ट लाइब्रेरी" में "नया प्रॉम्प्ट" पर क्लिक करें।\n2. प्लेसहोल्डर: चयनित टेक्स्ट के लिए {{text}} का उपयोग करें (जैसे: "अनुवाद करें: {{text}}")।\n3. त्वरित पहुँच: समर्थित AI साइटों पर, प्रॉम्प्ट शीर्षक टाइप करें या फ्लोटिंग बटन पर क्लिक करें।\n4. कस्टम वेरिएबल्स: आप डबल ब्रेसिज़ में किसी भी शब्द का उपयोग कर सकते हैं, जैसे {{language}}, और एक्सटेंशन इनपुट मांगेगा।\n\nआपका वर्तमान चयन: {{text}}',
      placeholders: ['text']
    }
  ],
  "ar": [
    {
      id: '1',
      title: '💡 دليل الاستخدام (اقرأني)',
      content: 'مرحباً بك في مساعد أوامر الذكاء الاصطناعي!\n\n1. كيفية التكوين: انقر فوق "أمر جديد" في "مكتبة الأوامر" في صفحة الإعدادات.\n2. العناصر النائبة: استخدم {{text}} لتمثيل النص المحدد (مثال: "ترجم: {{text}}").\n3. الوصول السريع: في مواقع الذكاء الاصطناعي المدعومة، اكتب عنوان الأمر أو انقر فوق الزر العائم.\n4. متغيرات مخصصة: يمكنك استخدام أي كلمة بين أقواس مزدوجة، مثل {{language}}، وسيطلب منك الامتداد إدخال القيمة.\n\nتحديدك الحالي: {{text}}',
      placeholders: ['text']
    }
  ],
  "id": [
    {
      id: '1',
      title: '💡 Panduan Penggunaan (Baca Saya)',
      content: 'Selamat datang di Asisten Prompt AI!\n\n1. Cara konfigurasi: Klik "Prompt Baru" di "Perpustakaan Prompt" pada halaman pengaturan.\n2. Placeholder: Gunakan {{text}} untuk mewakili teks yang dipilih (misalnya: "Terjemahkan: {{text}}").\n3. Akses Cepat: Di situs AI yang didukung, ketik judul prompt atau klik tombol mengambang.\n4. Variabel Kustom: Anda dapat menggunakan kata apa pun dalam kurung kurawal ganda, seperti {{language}}, dan ekstensi akan meminta input.\n\nPilihan Anda saat ini: {{text}}',
      placeholders: ['text']
    }
  ],
  "tr": [
    {
      id: '1',
      title: '💡 Kullanım Kılavuzu (Oku Beni)',
      content: 'AI İpucu Yardımcısı\'na hoş geldiniz!\n\n1. Nasıl yapılandırılır: Ayarlar sayfasındaki "İpucu Kitaplığı"nda "Yeni İpucu"na tıklayın.\n2. Yer tutucular: Seçili metni temsil etmek için {{text}} kullanın (örneğin: "Çevir: {{text}}").\n3. Hızlı Erişim: Desteklenen AI sitelerinde, ipucu başlığını yazın veya yüzen düğmeye tıklayın.\n4. Özel Değişkenler: {{language}} gibi çift süslü parantez içindeki herhangi bir kelimeyi kullanabilirsiniz, uzantı giriş isteyecektir.\n\nGeçerli seçiminiz: {{text}}',
      placeholders: ['text']
    }
  ],
  "vi": [
    {
      id: '1',
      title: '💡 Hướng dẫn sử dụng (Đọc kỹ)',
      content: 'Chào mừng bạn đến với Trợ lý Prompt AI!\n\n1. Cách cấu hình: Nhấp vào "Prompt Mới" trong "Kho Prompt" trên trang cài đặt.\n2. Chỗ trống: Sử dụng {{text}} để đại diện cho văn bản đã chọn (ví dụ: "Dịch: {{text}}").\n3. Truy cập nhanh: Trên các trang web AI được hỗ trợ, nhập tiêu đề prompt hoặc nhấp vào nút nổi.\n4. Biến tùy chỉnh: Bạn có thể sử dụng bất kỳ từ nào trong dấu ngoặc kép, như {{language}}, và tiện ích sẽ yêu cầu bạn nhập nội dung.\n\nLựa chọn hiện tại của bạn: {{text}}',
      placeholders: ['text']
    }
  ]
};

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
      // Detect browser language for initial prompts
      const browserLang = navigator.language.replace('-', '_');
      let initialLocale = 'en';
      
      if (browserLang.startsWith('zh')) {
        initialLocale = (browserLang === 'zh_TW' || browserLang === 'zh_HK') ? 'zh_TW' : 'zh_CN';
      } else {
        const langCode = browserLang.split('_')[0];
        if (defaultPromptsData[langCode]) {
          initialLocale = langCode;
        }
      }
      
      const prompts = defaultPromptsData[initialLocale] || defaultPromptsData['en'];
      chrome.storage.local.set({ prompts: prompts });
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

// Handle messages from options page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "get_default_prompts") {
    const locale = request.locale || 'en';
    const prompts = defaultPromptsData[locale] || defaultPromptsData['en'];
    sendResponse({ prompts });
  }
  return true; // Keep channel open for async response
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
