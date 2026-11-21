export const DEFAULT_URL = 'http://127.0.0.1:8085';
export function siteOrigin(value) {
  const url = new URL(value.trim());
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) || url.username || url.password) throw new Error('Use HTTPS or localhost');
  if (url.pathname !== '/' || url.search || url.hash) throw new Error('Enter the site origin only');
  return url.origin;
}
export function destination(origin, route) {
  if (!['/', '/plans', '/tracker', '/profile'].includes(route)) throw new Error('Unknown page');
  return siteOrigin(origin) + route;
}
