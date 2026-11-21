import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAtlas } from '../../core/store';
import { localize, type Exercise, type LoggedSet, type Session } from '../../domain/models';
import { editProgramDraft, type ProgramDraft } from '../../domain/programBuilder';
import { useDesign } from '../../design-system/theme';
import { Button, Card, Chip, Field, Label, Progress, Screen, Sheet, styles } from '../../design-system/ui';
import { ExerciseImage } from '../../design-system/ExerciseImage';
import { MotionPressable, Reveal } from '../../design-system/motion';
import { ExerciseDetails } from '../exercise-library/ExerciseDetails';
import { ProgramBuilder } from '../program-builder';
import { featureText } from '../../localization/features';

type Entry = Session['exercises'][number];
function SetEditor({ sessionId, entry, ordinal, saved, close, rest }: { sessionId: string; entry: Entry; ordinal: number; saved?: LoggedSet; close: () => void; rest: () => void }) {
  const { run } = useAtlas();
  const { language, t } = useDesign();
  const [reps, setReps] = useState(String(saved?.reps ?? entry.target.reps));
  const [weight, setWeight] = useState(String(saved?.weight ?? entry.target.weight ?? 0));
  return <Sheet visible title={t('set') + ' ' + ordinal + ' · ' + localize(entry.exercise.name, language)} close={close}>
    <View style={styles.row}><Field label={t('reps')} keyboardType="number-pad" value={reps} onChangeText={setReps} /><Field label={t('weight')} keyboardType="decimal-pad" value={weight} onChangeText={setWeight} /></View>
    <Button title={t('done')} icon="checkmark" onPress={() => { if (run(r => r.saveSet({ sessionId, exerciseId: entry.exercise.id, ordinal, reps: Number(reps), weight: Number(weight.replace(',', '.')) }))) { close(); if (!saved) rest(); } }} />
    {saved && <Button secondary title={t('undo')} onPress={() => { if (run(r => r.removeSet(sessionId, entry.exercise.id, ordinal))) close(); }} />}
  </Sheet>;
}
function TargetEditor({ session, entry, close }: { session: Session; entry: Entry; close: () => void }) {
  const { data, run } = useAtlas();
  const { language, t } = useDesign();
  const f = (key: Parameters<typeof featureText>[1]) => featureText(language, key);
  const [exerciseId, setExerciseId] = useState(entry.exercise.id);
  const [sets, setSets] = useState(String(entry.target.sets));
  const [reps, setReps] = useState(String(entry.target.reps));
  const [weight, setWeight] = useState(String(entry.target.weight ?? 0));
  const [rest, setRest] = useState(String(entry.target.restSeconds));
  const [picker, setPicker] = useState(false);
  const hasLogs = data!.sets.some(s => s.sessionId === session.id && s.exerciseId === entry.exercise.id);
  return <Sheet visible title={f('changeTarget')} close={close}>
    <Label muted size={12}>{f('todayOnly')}</Label>
    <Label bold>{localize(data!.exercises.find(e => e.id === exerciseId)!.name, language)}</Label>
    <View style={styles.row}><Field label={t('sets')} keyboardType="number-pad" value={sets} onChangeText={setSets} /><Field label={t('reps')} keyboardType="number-pad" value={reps} onChangeText={setReps} /></View>
    <View style={styles.row}><Field label={t('weight')} keyboardType="decimal-pad" value={weight} onChangeText={setWeight} /><Field label={f('seconds')} keyboardType="number-pad" value={rest} onChangeText={setRest} /></View>
    <Button title={f('changeExercise')} secondary disabled={hasLogs} onPress={() => setPicker(!picker)} />
    {hasLogs && <Label size={12} muted>{f('loggedProtected')}</Label>}
    {picker && <View style={{ gap: 8 }}>{data!.exercises.filter(e => e.id === entry.exercise.id || !session.exercises.some(x => x.exercise.id === e.id)).map(e => <Chip key={e.id} title={localize(e.name, language)} active={exerciseId === e.id} onPress={() => { setExerciseId(e.id); setPicker(false); }} />)}</View>}
    <Button title={t('save')} onPress={() => { if (run(r => r.editSessionExercise(session.id, entry.exercise.id, { ...entry.target, exerciseId, sets: Number(sets), reps: Number(reps), weight: Number(weight.replace(',', '.')), restSeconds: Number(rest) }))) close(); }} />
  </Sheet>;
}
export default function TrackerScreen() {
  const { data: snapshot, run } = useAtlas();
  const data = snapshot!;
  const { colors, language, t } = useDesign();
  const f = (key: Parameters<typeof featureText>[1]) => featureText(language, key);
  const session = data.sessions.find(s => !s.completedAt);
  const completed = data.sessions.filter(s => s.completedAt).sort((a, b) => b.date.localeCompare(a.date));
  const [restUntil, setRestUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [reward, setReward] = useState<number | null>(null);
  const [detail, setDetail] = useState<Session | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [logging, setLogging] = useState<{ exerciseId: string; ordinal: number } | null>(null);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [menu, setMenu] = useState(false);
  const [builder, setBuilder] = useState<ProgramDraft | null>(null);
  useEffect(() => { if (!session) return; const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, [session?.id]);
  const seconds = Math.max(0, Math.ceil((restUntil - now) / 1000));
  const targetCount = session?.exercises.reduce((sum, e) => sum + e.target.sets, 0) ?? 0;
  const loggedCount = data.sets.filter(s => s.sessionId === session?.id).length;
  const logEntry = session?.exercises.find(e => e.exercise.id === logging?.exerciseId);
  function startRest(seconds: number) { const time = Date.now(); setNow(time); setRestUntil(time + seconds * 1000); }
  const more = (label: string, press: () => void) => <MotionPressable accessibilityRole="button" accessibilityLabel={label} onPress={press} style={styles.iconButton}><Ionicons name="ellipsis-horizontal" size={23} color={colors.accent} /></MotionPressable>;
  return <Screen title={session ? localize(session.dayName, language) : t('history')} subtitle={session ? localize(session.programName, language) + ' · ' + session.date : t('tagline')} action={session ? more(f('splitSettings'), () => setMenu(true)) : undefined}>
    {session ? <>
      <Card><View style={[styles.row, { justifyContent: 'space-between' }]}><Label bold>{loggedCount} / {targetCount} {t('sets')}</Label><Label muted size={12}>{Math.max(0, Math.floor((now - Date.parse(session.startedAt)) / 60000))} {f('minutes')}</Label></View><Progress fraction={loggedCount / targetCount} />{seconds > 0 && <Reveal identity="rest"><View style={[styles.row, { justifyContent: 'space-between' }]}><Label bold>{t('restTimer')} · {seconds}{f('secondUnit')}</Label><Button title={t('skip')} secondary onPress={() => setRestUntil(0)} /></View></Reveal>}</Card>
      {session.exercises.map((entry, index) => {
        const { exercise, target } = entry;
        const saved = data.sets.filter(s => s.sessionId === session.id && s.exerciseId === exercise.id);
        const next = Array.from({ length: target.sets }, (_, i) => i + 1).find(n => !saved.some(s => s.ordinal === n));
        return <Reveal identity={session.id + '/' + exercise.id} key={exercise.id}><Card>
          <View style={styles.row}><MotionPressable accessibilityRole="button" accessibilityLabel={localize(exercise.name, language)} onPress={() => setSelectedExercise(exercise)} style={{ flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' }}><ExerciseImage exerciseId={exercise.id} size={76} /><View style={{ flex: 1, gap: 3 }}><Label size={10} style={{ color: colors.accent }}>{String(index + 1).padStart(2, '0')} · {t(exercise.equipment)}</Label><Label bold size={16}>{localize(exercise.name, language)}</Label></View></MotionPressable>{more(f('changeTarget') + ': ' + localize(exercise.name, language), () => setEditing(entry))}</View>
          <View style={[styles.row, { justifyContent: 'space-between' }]}><View><Label bold size={22}>{target.sets} × {target.reps}</Label><Label size={11} muted>{f('planned')}</Label></View><Label muted size={12}>{target.restSeconds}{f('secondUnit')}{target.weight ? ' · ' + target.weight + ' kg' : ''}</Label></View>
          <View style={styles.wrap}>{Array.from({ length: target.sets }, (_, i) => {
            const logged = saved.find(s => s.ordinal === i + 1);
            return <Chip key={i} active={!!logged} title={logged ? '✓ ' + (i + 1) + ' · ' + logged.reps + ' × ' + logged.weight : String(i + 1)} onPress={() => setLogging({ exerciseId: exercise.id, ordinal: i + 1 })} />;
          })}</View>
          <Button title={next ? f('logSet') + ' ' + next : f('allSaved')} secondary={!next} disabled={!next} icon={next ? 'add' : 'checkmark-circle-outline'} onPress={() => next && setLogging({ exerciseId: exercise.id, ordinal: next })} />
        </Card></Reveal>;
      })}
      <Button title={t('finish')} disabled={loggedCount !== targetCount} icon="checkmark-done" onPress={() => run(r => { const result = r.complete(session.id); setReward(result.amount); setRestUntil(0); })} />
    </> : completed.length ? <>
      <Card><Label muted size={12}>{t('volume')}</Label><Label size={35} bold>{data.sets.filter(s => completed.some(c => c.id === s.sessionId)).reduce((n, s) => n + s.weight * s.reps, 0).toLocaleString(language)}</Label></Card>
      {completed.map(s => <Card key={s.id}><Label muted size={12}>{s.date}</Label><Label bold size={20}>{localize(s.dayName, language)}</Label><Label muted>{localize(s.programName, language)}</Label><Button title={t('sets')} secondary onPress={() => setDetail(s)} /></Card>)}
    </> : <Card style={{ alignItems: 'center', paddingVertical: 38 }}><Ionicons name="journal-outline" size={54} color={colors.accent} /><Label size={23} bold>{t('emptyHistory')}</Label><Label muted style={{ textAlign: 'center', maxWidth: 330 }}>{t('historyBody')}</Label><Button title={t('home')} onPress={() => router.navigate('/')} /></Card>}
    <Sheet visible={menu && !!session} title={f('splitSettings')} close={() => setMenu(false)}>
      <Label muted size={12}>{f('todayOnly')}</Label>{session?.exercises.map(entry => <Button key={entry.exercise.id} title={localize(entry.exercise.name, language)} secondary icon="options-outline" onPress={() => { setMenu(false); setEditing(entry); }} />)}
      <Label muted size={12}>{f('futureNote')}</Label><Button title={f('futureSplit')} onPress={() => { const activated = data.activations.find(a => a.id === session?.activationId)?.program; const program = data.programs.find(p => p.id === activated?.id) ?? activated; if (program) { setMenu(false); setBuilder(editProgramDraft(program, language, program.owner === 'catalog')); } }} />
    </Sheet>
    {session && logging && logEntry && <SetEditor key={session.id + '/' + logging.exerciseId + '/' + logging.ordinal} sessionId={session.id} entry={logEntry} ordinal={logging.ordinal} saved={data.sets.find(s => s.sessionId === session.id && s.exerciseId === logging.exerciseId && s.ordinal === logging.ordinal)} close={() => setLogging(null)} rest={() => startRest(logEntry.target.restSeconds)} />}
    {session && editing && <TargetEditor session={session} entry={editing} close={() => setEditing(null)} />}
    {builder && <ProgramBuilder initial={builder} onClose={() => setBuilder(null)} onSaved={() => setBuilder(null)} />}
    <Sheet visible={reward !== null} title={t('complete')} close={() => setReward(null)}><Reveal identity="reward"><View style={{ alignItems: 'center', gap: 18, paddingVertical: 20 }}><Ionicons name="checkmark-circle-outline" size={72} color={colors.good} /><Label size={42} bold>+{reward} XP</Label><Label muted>{t('completeBody')}</Label></View></Reveal><Button title={t('close')} onPress={() => setReward(null)} /></Sheet>
    <Sheet visible={!!detail} title={detail ? localize(detail.dayName, language) : ''} close={() => setDetail(null)}>{detail?.exercises.map(e => <Card key={e.exercise.id}><Label bold>{localize(e.exercise.name, language)}</Label>{data.sets.filter(s => s.sessionId === detail.id && s.exerciseId === e.exercise.id).map(s => <Label key={s.ordinal} muted>{s.ordinal}. {s.reps} × {s.weight} kg</Label>)}</Card>)}</Sheet>
    <ExerciseDetails exercise={selectedExercise} close={() => setSelectedExercise(null)} />
  </Screen>;
}
