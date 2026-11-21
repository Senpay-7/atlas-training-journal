import * as SecureStore from 'expo-secure-store';
// Chunk long OAuth sessions into small secure-store entries (no plaintext token files).
type Manifest = { generation: string; count: number };
async function manifest(key: string): Promise<Manifest | null> {
  const value = await SecureStore.getItemAsync(key);
  return value ? JSON.parse(value) as Manifest : null;
}
const part = (key: string, data: Manifest, i: number) => key + '.' + data.generation + '.' + i;
async function discard(key: string, data: Manifest | null) {
  if (data) await Promise.all(Array.from({ length: data.count }, (_, i) => SecureStore.deleteItemAsync(part(key, data, i))));
}
export const authStorage = {
  async getItem(key: string) {
    const data = await manifest(key);
    if (!data) return null;
    const chunks = await Promise.all(Array.from({ length: data.count }, (_, i) => SecureStore.getItemAsync(part(key, data, i))));
    return chunks.some(chunk => chunk === null) ? null : chunks.join('');
  },
  async setItem(key: string, value: string) {
    const previous = await manifest(key);
    const data = { generation: Date.now().toString(36) + Math.random().toString(36).slice(2), count: Math.ceil(value.length / 500) };
    try {
      for (let i = 0; i < data.count; i++) await SecureStore.setItemAsync(part(key, data, i), value.slice(i * 500, (i + 1) * 500));
      await SecureStore.setItemAsync(key, JSON.stringify(data));
    } catch (error) { await discard(key, data).catch(() => {}); throw error; }
    await discard(key, previous).catch(() => {});
  },
  async removeItem(key: string) { const data = await manifest(key); await SecureStore.deleteItemAsync(key); await discard(key, data); },
};
