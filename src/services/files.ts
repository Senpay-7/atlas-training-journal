import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export async function downloadText(name: string, text: string, mime = 'application/json') {
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = name;
    anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 30000);
    return;
  }
  if (!FileSystem.cacheDirectory || !(await Sharing.isAvailableAsync())) throw new Error('File sharing is unavailable on this device');
  const uri = FileSystem.cacheDirectory + name;
  await FileSystem.writeAsStringAsync(uri, text);
  await Sharing.shareAsync(uri, { mimeType: mime, UTI: mime === 'text/csv' ? 'public.comma-separated-values-text' : 'public.json' });
}
export async function pickBackup() {
  const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain'], copyToCacheDirectory: true });
  if (result.canceled) return null;
  const file = result.assets[0];
  if (!file) return null;
  if ((file.size ?? 0) > 20_000_000) throw new Error('Backup exceeds the 20 MB limit');
  return Platform.OS === 'web' ? await (await fetch(file.uri)).text() : await FileSystem.readAsStringAsync(file.uri);
}
