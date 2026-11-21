import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useAtlas } from '../../core/store';
import { Button, Card, Field, Label, Sheet, styles } from '../../design-system/ui';
import { useDesign } from '../../design-system/theme';
import { featureText } from '../../localization/features';
import { cloudConfigured } from '../../services/cloudClient';
import { requestEmailCode, signInGoogle, signOut, useAccount, verifyEmailCode } from '../../services/auth';
import { readCloud, writeCloud } from '../../services/cloudSync';
import { SyncConflict, type CloudCopy } from '../../services/syncProtocol';
import type { Backup } from '../../services/backup';

export function AccountPanel({ visible, close }: { visible: boolean; close: () => void }) {
  const { user, ready, error: authError } = useAccount();
  const { data, run } = useAtlas();
  const { colors, language, t } = useDesign();
  const f = (key: Parameters<typeof featureText>[1]) => featureText(language, key);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [checked, setChecked] = useState<{ userId: string; copy: CloudCopy | null } | null>(null);
  const [confirmation, setConfirmation] = useState<'upload' | 'download' | null>(null);
  useEffect(() => { setChecked(null); setMessage(''); setError(''); setConfirmation(null); setCode(''); setSent(false); }, [user?.id]);
  async function action(task: () => Promise<void>) {
    setBusy(true); setMessage(''); setError('');
    try { await task(); } catch (e) { setError(e instanceof SyncConflict ? f('conflict') : e instanceof Error ? e.message : String(e)); if (e instanceof SyncConflict) setChecked(null); }
    finally { setBusy(false); }
  }
  const reviewed = checked?.userId === user?.id ? checked : null;
  const count = (sessions: number, sets: number) => sessions + ' ' + t('sessions') + ' · ' + sets + ' ' + t('sets');
  async function transfer() {
    if (!user || !reviewed) return;
    const userId = user.id;
    if (confirmation === 'upload') {
      let snapshot: Backup | undefined;
      if (!run(repo => { snapshot = repo.export(); }) || !snapshot) return;
      const copy = await writeCloud(userId, reviewed.copy?.revision ?? 0, snapshot);
      setChecked({ userId, copy });
    } else if (confirmation === 'download' && reviewed.copy) {
      if (useAtlas.getState().data?.sessions.some(s => !s.completedAt)) throw new Error(f('activeSync'));
      const fresh = await readCloud(userId);
      if (fresh?.revision !== reviewed.copy.revision) throw new SyncConflict();
      if (!run(repo => repo.restore(JSON.stringify(fresh.payload)))) return;
    }
    setConfirmation(null); setMessage(f('syncDone'));
  }
  return <Sheet visible={visible} title={f('account')} close={() => { if (!busy) close(); }}>
    {!cloudConfigured ? <Card><Label bold>{f('localReady')}</Label><Label muted>{f('cloudSetup')}</Label></Card> : !ready ? <Label>…</Label> : !user ? <>
      <Button title="Google" icon="logo-google" disabled={busy} onPress={() => void action(signInGoogle)} />
      <Label bold>{f('emailCode')}</Label><Field label="Email" autoCapitalize="none" keyboardType="email-address" value={email} editable={!busy} onChangeText={value => { setEmail(value); setSent(false); setCode(''); }} />
      <Button title={f('sendCode')} secondary disabled={busy || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())} onPress={() => void action(async () => { await requestEmailCode(email); setSent(true); setMessage(f('sent')); })} />
      {sent && <><Field label={f('code')} value={code} keyboardType="number-pad" autoComplete="one-time-code" editable={!busy} onChangeText={setCode} /><Button title={f('verify')} disabled={busy || code.trim().length < 6} onPress={() => void action(() => verifyEmailCode(email, code))} /></>}
    </> : <>
      <Card><Label bold>{user.email ?? user.id}</Label><Label muted size={12}>{f('cloudChoice')}</Label></Card>
      <Card><Label bold>{f('device')}</Label><Label>{count(data!.sessions.length, data!.sets.length)}</Label></Card>
      <Button title={f('inspectCloud')} icon="cloud-download-outline" disabled={busy} onPress={() => void action(async () => { const copy = await readCloud(user.id); setChecked({ userId: user.id, copy }); setConfirmation(null); })} />
      {reviewed && <Card><Label bold>{f('cloud')}</Label><Label>{reviewed.copy ? count(reviewed.copy.payload.sessions.length, reviewed.copy.payload.sets.length) : f('noCloud')}</Label>{reviewed.copy && <Label muted size={12}>v{reviewed.copy.revision} · {new Date(reviewed.copy.updated_at).toLocaleString(language)}</Label>}
        {!confirmation ? <><Button title={f('upload')} disabled={busy} secondary onPress={() => setConfirmation('upload')} /><Button title={f('download')} disabled={busy || !reviewed.copy || data!.sessions.some(s => !s.completedAt)} secondary onPress={() => setConfirmation('download')} /></> : <View style={{ gap: 12 }}><Label bold>{f(confirmation)} · {user.email}</Label><View style={styles.wrap}><Button title={t('save')} disabled={busy} onPress={() => void action(transfer)} /><Button title={t('cancel')} secondary disabled={busy} onPress={() => setConfirmation(null)} /></View></View>}
      </Card>}
      <Label muted size={12}>{f('signOutNote')}</Label><Button title={f('signOut')} secondary disabled={busy} onPress={() => void action(signOut)} />
    </>}
    {!!message && <Label style={{ color: colors.good }}>{message}</Label>}{!!(error || authError) && <Label style={{ color: colors.danger }}>{error || authError}</Label>}
  </Sheet>;
}
