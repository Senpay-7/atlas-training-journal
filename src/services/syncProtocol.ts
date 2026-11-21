import { parseBackup, type Backup } from './backup';
export const MAX_CLOUD_BYTES = 500_000;
export type CloudCopy = { revision: number; payload: Backup; updated_at: string };
function utf8Length(text: string) {
  let bytes = 0;
  for (const character of text) {
    const code = character.codePointAt(0)!;
    bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
  }
  return bytes;
}
export function cloudPayload(value: unknown) {
  const text = JSON.stringify(value);
  if (!text || utf8Length(text) > MAX_CLOUD_BYTES) throw new Error('Cloud snapshot exceeds the 500 KB beta limit. Export a local backup.');
  return parseBackup(text);
}
export function parseCloudCopy(value: unknown): CloudCopy {
  const row = value as Partial<CloudCopy> | null;
  if (!row || !Number.isSafeInteger(row.revision) || row.revision! < 1 || typeof row.updated_at !== 'string' || !Number.isFinite(Date.parse(row.updated_at))) throw new Error('Invalid cloud revision');
  return { revision: row.revision!, updated_at: row.updated_at, payload: cloudPayload(row.payload) };
}
export class SyncConflict extends Error { constructor() { super('SYNC_CONFLICT'); } }
export function acceptWrite(value: unknown, expected: number): CloudCopy {
  const result = value as { conflict?: boolean; row?: unknown } | null;
  if (result?.conflict === true) throw new SyncConflict();
  const row = parseCloudCopy(result?.row);
  if (row.revision !== expected + 1) throw new Error('Unexpected cloud revision');
  return row;
}
