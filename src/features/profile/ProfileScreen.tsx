import { useState } from 'react';
import { Linking, Pressable, Switch, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAtlas } from '../../core/store';
import { useToday } from '../../core/useToday';
import { addDays, resolveSchedule } from '../../domain/scheduling';
import { levelFromXP } from '../../domain/progression';
import { sourceRegister } from '../../content/sources';
import { MediaCredits } from '../exercise-library/ExerciseDetails';
import { Button, Card, Chip, Field, Label, Progress, Screen, Sheet, styles } from '../../design-system/ui';
import { gradients, useDesign } from '../../design-system/theme';
import { downloadText, pickBackup } from '../../services/files';
import { previewBackup } from '../../services/backup';
import { featureText } from '../../localization/features';
import { AccountPanel } from './AccountPanel';

export default function ProfileScreen() {
  const { data: snapshot, run } = useAtlas();
  const data = snapshot!;
  const { colors, language, t } = useDesign();
  const today = useToday();
  const [panel, setPanel] = useState<'edit' | 'banner' | 'settings' | 'sources' | null>(null);
  const [draftName, setDraftName] = useState(data.profile.name);
  const [draftBio, setDraftBio] = useState(data.profile.bio);
  const [pendingBackup, setPendingBackup] = useState<string | null>(null);
  const [account, setAccount] = useState(false);
  const preview = pendingBackup ? previewBackup(pendingBackup) : null;
  const completed = data.sessions.filter(s => s.completedAt);
  const weekStart = addDays(today, -((new Date(today + 'T12:00:00Z').getUTCDay() + 6) % 7));
  const weeklyCount = completed.filter(s => s.date >= weekStart && s.date <= today).length;
  const plannedCount = Array.from({ length: 7 }, (_, day) => resolveSchedule(data.activations, data.rests, addDays(weekStart, day))).filter(plan => plan?.day).length;
  const weeklyTarget = Math.min(3, plannedCount || 3);
  const xp = levelFromXP(data.xp.reduce((n, e) => n + e.amount, 0));
  const gradient = gradients[data.profile.banner] ?? (data.preferences.theme !== 'light' ? ['#1a1c2e', '#0f1019'] as const : ['#e8edf5', '#d4dce8'] as const);
  async function fileAction(action: () => Promise<void>) {
    try { await action(); } catch (error) { useAtlas.setState({ error: String(error) }); }
  }
  function exportBackup() { run(r => { const text = JSON.stringify(r.export(), null, 2); void fileAction(() => downloadText(`atlas-${today}.json`, text)); }); }
  function exportCSV() {
    const rows = [['session_id', 'date', 'exercise_id', 'set', 'reps', 'weight_kg'], ...data.sets.map(s => [s.sessionId, data.sessions.find(w => w.id === s.sessionId)?.date ?? '', s.exerciseId, String(s.ordinal), String(s.reps), String(s.weight)])];
    const escape = (cell: string) => `"${(/^[=+@\-\t\r]/.test(cell) ? "'" + cell : cell).replaceAll('"', '""')}"`;
    void fileAction(() => downloadText(`atlas-sets-${today}.csv`, rows.map(row => row.map(escape).join(',')).join('\r\n'), 'text/csv'));
  }
  return <Screen title={t('profile')} subtitle={t('tagline')} action={<Pressable accessibilityRole="button" accessibilityLabel={t('settings')} style={styles.iconButton} onPress={() => setPanel('settings')}><Ionicons name="settings-outline" color={colors.accent} size={25} /></Pressable>}>
    <View style={{ alignItems: 'center', gap: 12 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('banner')} onPress={() => setPanel('banner')} style={{ width: '100%', aspectRatio: 3, borderRadius: 22, overflow: 'hidden' }}><LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{ width: 110, height: 110, transform: [{ rotate: '45deg' }], borderWidth: 1, borderColor: '#FFFFFF25', borderRadius: 20 }} /><View style={{ position: 'absolute' }}><Label bold size={14} style={{ letterSpacing: 8, color: '#FFFFFFAA' }}>ATLAS</Label></View></LinearGradient></Pressable>
      <View style={{ width: 92, height: 92, borderRadius: 26, borderWidth: 5, borderColor: colors.background, backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center', marginTop: -40 }}><Label size={33} bold style={{ color: colors.accent }}>{data.profile.name.slice(0, 1).toUpperCase()}</Label></View>
      <Label bold size={26}>{data.profile.name}</Label><Label size={12} muted>{t('joined')} {data.profile.joined}</Label>{!!data.profile.bio && <Label style={{ textAlign: 'center' }}>{data.profile.bio}</Label>}
      <Button title={t('editProfile')} secondary icon="create-outline" onPress={() => { setDraftName(data.profile.name); setDraftBio(data.profile.bio); setPanel('edit'); }} />
    </View>
    <Card><View style={[styles.row, { justifyContent: 'space-between' }]}><View><Label muted size={11}>{t('character').toUpperCase()}</Label><Label bold size={29}>{t('level')} {xp.level}</Label></View><View style={{ backgroundColor: colors.raised, width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="diamond-outline" color={colors.accent} size={30} /></View></View><Progress fraction={xp.fraction} /><View style={[styles.row, { justifyContent: 'space-between' }]}><Label muted size={12}>{xp.current} / {xp.required} XP</Label><Label muted size={12}>{xp.total} XP</Label></View><Label muted size={12}>{t('xpNote')}</Label></Card>
    <Card><Label bold>{t('quest')}</Label><Label>{t('questBody').replace('3', String(weeklyTarget))}</Label><Progress fraction={Math.min(weeklyCount, weeklyTarget) / weeklyTarget} /><Label muted size={12}>{Math.min(weeklyCount, weeklyTarget)} / {weeklyTarget} · {weekStart}</Label></Card>
    <Card><View style={styles.row}><Ionicons name={completed.length ? 'ribbon' : 'ribbon-outline'} color={completed.length ? colors.good : colors.muted} size={34} /><View style={{ flex: 1 }}><Label bold>{t('milestone')}</Label><Label size={12} muted>{t('milestoneBody')}</Label></View></View><Label size={12} style={{ color: completed.length ? colors.good : colors.muted }}>{t(completed.length ? 'unlocked' : 'locked')}</Label></Card>
    <Button title={t('settings')} secondary icon="options-outline" onPress={() => setPanel('settings')} />
    <Button title={featureText(language, 'account')} secondary icon="cloud-outline" onPress={() => setAccount(true)} />
    <Button title={t('sources')} secondary icon="link-outline" onPress={() => setPanel('sources')} />
    <AccountPanel visible={account} close={() => setAccount(false)} />
    <Sheet visible={panel === 'edit'} title={t('editProfile')} close={() => setPanel(null)}><Field label={t('name')} value={draftName} maxLength={60} onChangeText={setDraftName} /><Field label={t('bio')} value={draftBio} maxLength={240} multiline onChangeText={setDraftBio} /><Button title={t('save')} onPress={() => { if (run(r => r.profile({ ...data.profile, name: draftName, bio: draftBio }))) setPanel(null); }} /></Sheet>
    <Sheet visible={panel === 'banner'} title={t('banner')} close={() => setPanel(null)}><View style={styles.wrap}>{gradients.map((gradientColors, index) => <Pressable key={index} accessibilityRole="button" accessibilityLabel={`Gradient ${index + 1}`} accessibilityState={{ selected: data.profile.banner === index }} onPress={() => run(r => r.profile({ ...data.profile, banner: index }))} style={{ width: '47%', aspectRatio: 3, borderRadius: 12, borderWidth: 3, borderColor: data.profile.banner === index ? colors.accent : colors.border, overflow: 'hidden' }}><LinearGradient colors={gradientColors} style={{ flex: 1 }} /></Pressable>)}</View><Button title={t('default')} secondary onPress={() => run(r => r.profile({ ...data.profile, banner: -1 }))} /><Button title={t('close')} onPress={() => setPanel(null)} /></Sheet>
    <Sheet visible={panel === 'settings'} title={t('settings')} close={() => setPanel(null)}>
      <Label bold>{t('language')}</Label><View style={styles.wrap}>{([['uk', 'Українська'], ['en', 'English'], ['ru', 'Русский']] as const).map(([value, label]) => <Chip key={value} title={label} active={data.preferences.language === value} onPress={() => run(r => r.preferences({ ...data.preferences, language: value }))} />)}</View>
      <Label bold>{t('appearance')}</Label><View style={styles.wrap}>{(['dark', 'light', 'black'] as const).map(value => <Chip key={value} title={featureText(language, value === 'dark' ? 'navy' : value === 'light' ? 'white' : 'black')} active={data.preferences.theme === value} onPress={() => run(r => r.preferences({ ...data.preferences, theme: value }))} />)}</View>
      <Label bold>{t('navigation')}</Label><View style={styles.wrap}>{(['balanced', 'floating', 'minimal', 'dynamic'] as const).map(value => <Chip key={value} title={featureText(language, value)} active={data.preferences.navigation === value} onPress={() => run(r => r.preferences({ ...data.preferences, navigation: value }))} />)}</View>
      <View style={[styles.row, { justifyContent: 'space-between' }]}><Label>{t('motion')}</Label><Switch accessibilityLabel={t('motion')} trackColor={{ false: colors.border, true: colors.button }} thumbColor={colors.buttonText} value={data.preferences.reducedMotion} onValueChange={reducedMotion => { run(r => r.preferences({ ...data.preferences, reducedMotion })); }} /></View>
      <Label bold>{t('data')}</Label><Button title={t('export')} secondary onPress={exportBackup} /><Button title={t('csv')} secondary onPress={exportCSV} /><Button title={t('import')} secondary onPress={() => void fileAction(async () => { const text = await pickBackup(); if (text) { previewBackup(text); setPendingBackup(text); setPanel(null); } })} />
      <Button title={t('recoveryExport')} secondary onPress={() => run(r => { const backup = r.recoveryBackup(); if (!backup) throw new Error(t('noRecovery')); void fileAction(() => downloadText(`atlas-recovery-${today}.json`, backup)); })} />
    </Sheet>
    <Sheet visible={panel === 'sources'} title={t('sources')} close={() => setPanel(null)}><Label muted>{t('sourceNote')}</Label><Card><MediaCredits /></Card>{sourceRegister.map(source => <Card key={source.id}><Label bold>{source.name}</Label><Label size={12} muted>{source.verifiedOn} · {source.status}</Label><Button title={t('sourceLink')} secondary onPress={() => void fileAction(() => Linking.openURL(source.url))} /></Card>)}</Sheet>
    <Sheet visible={!!pendingBackup} title={t('import')} close={() => setPendingBackup(null)}><Label muted>{t('restoreNote')}</Label><Label>{preview?.sessions} {t('sessions')} · {preview?.sets} {t('sets')} · {preview?.programs} {t('plans')}</Label><Button title={t('restore')} onPress={() => { if (pendingBackup && run(r => r.restore(pendingBackup))) setPendingBackup(null); }} /><Button title={t('cancel')} secondary onPress={() => setPendingBackup(null)} /></Sheet>
  </Screen>;
}
