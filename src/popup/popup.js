// Initialize i18n
I18n.init().then(() => {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const msg = I18n.getMessage(key);
    if (msg) element.innerText = msg;
  });
});

document.getElementById('openOptions').addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('src/options/options.html'));
  }
});
