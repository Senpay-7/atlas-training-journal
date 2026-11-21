// Web sessions live in the website origin; the extension opens that same origin.
export const authStorage = {
  getItem: (key: string) => typeof localStorage === 'undefined' ? null : localStorage.getItem(key),
  setItem: (key: string, value: string) => { localStorage.setItem(key, value); },
  removeItem: (key: string) => { localStorage.removeItem(key); },
};
