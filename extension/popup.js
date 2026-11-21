import { DEFAULT_URL, destination, siteOrigin } from './urls.mjs';
const copy = {
  en: { intro: 'Your training, one tab away. Opens the ATLAS website with its existing account and data.', home: 'Open ATLAS', plans: 'Plans', tracker: 'Workout', account: 'Account', settings: 'Website address', originLabel: 'ATLAS site URL', save: 'Save address', localNote: 'For the local preview, run Open-ATLAS.cmd first. This companion needs the website; it is not a separate offline app.', saved: 'Address saved.', invalid: 'Enter an HTTPS origin, or local http://127.0.0.1:8085, without a path.' },
  ru: { intro: 'Тренировки в одной вкладке. Открывает сайт ATLAS с его аккаунтом и данными.', home: 'Открыть ATLAS', plans: 'Планы', tracker: 'Тренировка', account: 'Аккаунт', settings: 'Адрес сайта', originLabel: 'URL сайта ATLAS', save: 'Сохранить адрес', localNote: 'Для локальной версии сначала запусти Open-ATLAS.cmd. Помощник открывает сайт; это не отдельное офлайн-приложение.', saved: 'Адрес сохранён.', invalid: 'Укажи HTTPS-адрес или http://127.0.0.1:8085 без пути страницы.' },
  uk: { intro: 'Тренування в одній вкладці. Відкриває сайт ATLAS із його акаунтом і даними.', home: 'Відкрити ATLAS', plans: 'Плани', tracker: 'Тренування', account: 'Акаунт', settings: 'Адреса сайту', originLabel: 'URL сайту ATLAS', save: 'Зберегти адресу', localNote: 'Для локальної версії спочатку запусти Open-ATLAS.cmd. Помічник відкриває сайт; це не окремий офлайн-застосунок.', saved: 'Адресу збережено.', invalid: 'Укажи HTTPS-адресу або http://127.0.0.1:8085 без шляху сторінки.' },
};
const saved = await chrome.storage.local.get(['origin', 'language']);
let language = copy[saved.language] ? saved.language : (copy[navigator.language.slice(0, 2)] ? navigator.language.slice(0, 2) : 'en');
let origin = DEFAULT_URL;
try { if (saved.origin) origin = siteOrigin(saved.origin); } catch { /* Ignore invalid previous preferences. */ }
const status = document.querySelector('#status');
function render() {
  document.documentElement.lang = language;
  for (const [id, value] of Object.entries(copy[language])) { const element = document.getElementById(id); if (element) element.textContent = value; }
  document.querySelector('#language').value = language;
}
render();
document.querySelector('#origin').value = origin;
document.querySelector('#language').addEventListener('change', async event => { language = event.target.value; await chrome.storage.local.set({ language }); render(); });
document.querySelector('#config').addEventListener('submit', async event => {
  event.preventDefault();
  try { origin = siteOrigin(document.querySelector('#origin').value); await chrome.storage.local.set({ origin }); status.textContent = copy[language].saved; }
  catch { status.textContent = copy[language].invalid; }
});
for (const button of document.querySelectorAll('[data-route]')) button.addEventListener('click', async () => {
  try { await chrome.tabs.create({ url: destination(origin, button.dataset.route) }); }
  catch (error) { status.textContent = error.message; }
});
