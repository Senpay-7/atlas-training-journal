import { requireCloud, useAccount } from './auth';
import { acceptWrite, cloudPayload, parseCloudCopy } from './syncProtocol';
import type { Backup } from './backup';
function checkAccount(userId: string) {
  if (useAccount.getState().user?.id !== userId) throw new Error('Account changed. Check cloud copy again.');
}
export async function readCloud(userId: string) {
  checkAccount(userId);
  const { data, error } = await requireCloud().from('atlas_snapshots').select('revision,payload,updated_at').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  checkAccount(userId);
  return data ? parseCloudCopy(data) : null;
}
export async function writeCloud(userId: string, expectedRevision: number, snapshot: Backup) {
  checkAccount(userId);
  const payload = cloudPayload(snapshot);
  const { data, error } = await requireCloud().rpc('save_atlas_snapshot', { expected_user: userId, expected_revision: expectedRevision, next_payload: payload });
  if (error) throw error;
  checkAccount(userId);
  return acceptWrite(data, expectedRevision);
}
