import { useEffect, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAtlas } from '../../core/store';
import { useToday } from '../../core/useToday';
import { addDays, resolveSchedule } from '../../domain/scheduling';
import { localize, type Exercise, type RestException } from '../../domain/models';
import { levelFromXP } from '../../domain/progression';
import { estimateMinutes, weekDates } from '../../domain/homeSummary';
import { Button, Chip, Label, Progress, Screen, Sheet, styles } from '../../design-system/ui';
import { useDesign } from '../../design-system/theme';
import { MotionPressable, Reveal } from '../../design-system/motion';
import { AtlasMark } from '../../design-system/AtlasMark';
import { homeText, muscleNames, exerciseCount } from './strings';
import { TrainingArtwork } from './TrainingArtwork';
import { ExerciseImage } from '../../design-system/ExerciseImage';
import { ExerciseDetails } from '../exercise-library/ExerciseDetails';
import { mediaText } from '../exercise-library/mediaStrings';

export default function HomeScreen() {
  const { data: snapshot, run } = useAtlas();
  const data = snapshot!;
  const { colors, language, t } = useDesign();
  const compact = useWindowDimensions().width < 420;
  const h = (key: Parameters<typeof homeText>[1]) => homeText(language, key);
  const today = useToday();
  const [hour, setHour] = useState(new Date().getHours());
  useEffect(() => { const timer = setInterval(() => setHour(new Date().getHours()), 60000); return () => clearInterval(timer); }, []);
  const [restOpen, setRestOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [mode, setMode] = useState<'keep' | 'shift'>('shift');
  const scheduled = resolveSchedule(data.activations, data.rests, today);
  const active = data.sessions.find(s => !s.completedAt);
  const completed = data.sessions.filter(s => s.completedAt).sort((a, b) => b.date.localeCompare(a.date));
  const doneToday = completed.find(s => s.date === today);
  const xp = levelFromXP(data.xp.reduce((n, e) => n + e.amount, 0));
  const week = weekDates(today);
  const weeklyCount = completed.filter(s => week.includes(s.date)).length;
  const entries = active?.exercises ?? doneToday?.exercises ?? scheduled?.day?.exercises.map(target => ({ target, exercise: data.exercises.find(e => e.id === target.exerciseId)! })) ?? [];
  const muscles = [...new Set(entries.flatMap(e => e.exercise?.muscles.slice(0, 1) ?? []))].slice(0, 3);
  const visualExercises = entries.length ? entries.map(e => e.exercise).filter((e): e is Exercise => !!e) : ['goblet-squat', 'db-press', 'row'].map(id => data.exercises.find(e => e.id === id)).filter((e): e is Exercise => !!e);
  const programName = active?.programName ?? doneToday?.programName ?? scheduled?.activation.program.name;
  const upcoming = Array.from({ length: 56 }, (_, i) => {
    const date = addDays(today, i + 1);
    return { date, plan: resolveSchedule(data.activations, data.rests, date) };
  }).find(item => item.plan?.day);
  const status = active ? 'running' : doneToday ? 'complete' : scheduled?.day ? 'training' : scheduled ? 'recovery' : 'ready';
  const title = active ? localize(active.dayName, language) : doneToday ? t('completedToday') : scheduled?.day ? localize(scheduled.day.name, language) : scheduled ? h('recoveryTitle') : h('startTitle');
  const dateLabel = (date: string, weekday = false) => new Date(date + 'T12:00:00').toLocaleDateString(language, { ...(weekday ? { weekday: 'short' as const } : {}), day: 'numeric', month: 'short' });
  const previewRests: RestException[] = scheduled ? [...data.rests.filter(r => !(r.date === today && r.activationId === scheduled.activation.id)), { activationId: scheduled.activation.id, date: today, mode }] : data.rests;
  const scheduleRows = (rests: RestException[]) => Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index), plan = resolveSchedule(data.activations, rests, date);
    return <View key={date} style={[styles.row, { paddingVertical: 10, borderBottomColor: colors.border, borderBottomWidth: index < 6 ? 1 : 0 }]}>
      <View style={{ width: 55 }}><Label size={11} muted>{new Date(date + 'T12:00:00').toLocaleDateString(language, { weekday: 'short' }).toUpperCase()}</Label><Label size={20} bold>{date.slice(-2)}</Label></View>
      <View style={{ width: 3, height: 27, borderRadius: 2, backgroundColor: plan?.day ? colors.accent : colors.border }} />
      <View style={{ flex: 1 }}><Label bold size={14}>{plan?.day ? localize(plan.day.name, language) : plan ? t('rest') : '—'}</Label>{plan && <Label muted size={11}>{localize(plan.activation.program.name, language)}</Label>}</View>
      {completed.some(s => s.date === date) && <Ionicons name="checkmark-circle" color={colors.good} size={21} />}
    </View>;
  });
  const heroAction = active ? t('resume') : !scheduled ? t('choose') : scheduled.day && !doneToday ? t('start') : t('history');
  function openWorkout() {
    if (active) router.navigate('/tracker');
    else if (!scheduled) router.navigate('/plans');
    else if (scheduled.day && !doneToday) { if (run(r => { r.start(today); })) router.navigate('/tracker'); }
    else router.navigate('/tracker');
  }
  return <Screen header={<View style={{ gap: 22, marginBottom: 22 }}>
    <View style={[styles.row, { justifyContent: 'space-between' }]}>
      <View style={[styles.row, { gap: 8 }]}><AtlasMark color={colors.accent} size={23} /><Label bold size={14} style={{ letterSpacing: 2.8 }}>ATLAS</Label></View>
      <MotionPressable accessibilityRole="button" accessibilityLabel={t('profile')} onPress={() => router.navigate('/profile')} style={[styles.row, { gap: 9, minHeight: 44 }]}>
        <Label size={11} muted style={{ fontVariant: ['tabular-nums'] }}>LV. {String(xp.level).padStart(2, '0')}</Label>
        <View style={{ width: 36, height: 36, borderRadius: 13, backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}><Label bold size={15}>{data.profile.name.slice(0, 1).toUpperCase()}</Label></View>
      </MotionPressable>
    </View>
    <View style={{ gap: 5 }}><Label muted size={13}>{h(hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening')}, {data.profile.name}</Label>
      <View style={[styles.row, { justifyContent: 'space-between', alignItems: 'baseline' }]}><Label bold size={28} style={{ letterSpacing: -0.9 }}>{h('today')}</Label><Label muted size={13}>{dateLabel(today, true)}</Label></View>
    </View>
  </View>}>
    <Reveal identity={`${today}/${status}/${active?.id ?? scheduled?.activation.id ?? 'empty'}`}>
      <View style={{ padding: 22, gap: 16, borderRadius: 22, backgroundColor: colors.hero, overflow: 'hidden' }}>
        <View style={[styles.row, { justifyContent: 'space-between' }]}>
          <Label bold size={10} style={{ color: colors.heroMuted, letterSpacing: 1.4, flex: 1 }}>{h(status)}</Label>
          {compact && !doneToday ? <TrainingArtwork exerciseId={entries[0]?.exercise?.id ?? 'bench'} size={56} /> : <Ionicons name={doneToday ? 'checkmark-circle-outline' : active ? 'ellipse' : scheduled?.day ? 'barbell-outline' : 'leaf-outline'} size={17} color={colors.heroMuted} />}
        </View>
        {programName && <Label size={12} style={{ color: colors.heroMuted }}>{localize(programName, language)}</Label>}
        <View style={[styles.row, { gap: 10 }]}>
          <View style={{ flex: 1, gap: 10 }}><Label size={entries.length ? 27 : 25} bold style={{ color: colors.heroText, letterSpacing: -0.8, lineHeight: 31 }}>{title}</Label>
            {entries.length > 0 && <Label size={12} style={{ color: colors.heroMuted }}>{muscles.map(m => muscleNames[m] ? localize(muscleNames[m]!, language) : m).join(' · ')}</Label>}
          </View>
          {!doneToday && !compact && <TrainingArtwork exerciseId={entries[0]?.exercise?.id ?? 'bench'} />}
        </View>
        {entries.length > 0 ? <View style={[styles.row, { borderTopWidth: 1, borderColor: colors.heroLine, paddingTop: 14, flexWrap: 'wrap', gap: 15 }]}>
          <View style={[styles.row, { gap: 6 }]}><Ionicons name="list-outline" size={16} color={colors.heroMuted} /><Label size={12} style={{ color: colors.heroText }}>{exerciseCount(language, entries.length)}</Label></View>
          <View style={[styles.row, { gap: 6 }]}><Ionicons name="time-outline" size={16} color={colors.heroMuted} /><Label size={12} style={{ color: colors.heroText }}>~{estimateMinutes(entries.map(e => e.target))} {h('minutes')}</Label></View>
        </View> : <Label size={13} style={{ color: colors.heroMuted, lineHeight: 20 }}>{scheduled ? h('recoveryBody') : h('startBody')}</Label>}
        <MotionPressable accessibilityRole="button" accessibilityLabel={heroAction} onPress={openWorkout} style={[styles.row, { backgroundColor: colors.heroButton, minHeight: 48, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'space-between' }]}>
          <Label bold size={14} style={{ color: colors.heroButtonText, flex: 1 }}>{heroAction}</Label><Ionicons name={scheduled?.day && !doneToday && !active ? 'play' : 'arrow-forward'} color={colors.heroButtonText} size={17} />
        </MotionPressable>
      </View>
    </Reveal>

    <View style={{ gap: 12 }}>
      <View style={[styles.row, { justifyContent: 'space-between' }]}><Label bold size={16} style={{ flex: 1 }}>{mediaText(language, entries.length ? 'preview' : 'discover')}</Label><MotionPressable accessibilityRole="button" accessibilityLabel={t('library')} onPress={() => router.navigate('/explore')} style={{ minWidth: 44, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' }}><Ionicons name="arrow-forward" color={colors.accent} size={20} /></MotionPressable></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 3 }}>
        {visualExercises.map(exercise => <MotionPressable key={exercise.id} accessibilityRole="button" accessibilityLabel={`${mediaText(language, 'open')}: ${localize(exercise.name, language)}`} onPress={() => setSelectedExercise(exercise)} style={{ width: 110, gap: 8 }}><ExerciseImage exerciseId={exercise.id} size={110} /><Label size={12} bold>{localize(exercise.name, language)}</Label></MotionPressable>)}
      </ScrollView>
    </View>

    <View style={{ gap: 14 }}>
      <View style={[styles.row, { justifyContent: 'space-between' }]}><Label bold size={16}>{h('week')}</Label><Label size={12} muted>{weeklyCount} {h('logged')}</Label></View>
      <View style={{ flexDirection: 'row', gap: 5 }}>
        {week.map(date => {
          const day = resolveSchedule(data.activations, data.rests, date);
          const completedHere = completed.some(s => s.date === date);
          const isToday = date === today;
          const weekday = new Date(date + 'T12:00:00').toLocaleDateString(language, { weekday: 'short' }).replace('.', '');
          return <View key={date} accessible accessibilityLabel={`${dateLabel(date, true)}: ${completedHere ? h('logged') : day?.day ? h('planned') : day ? h('rest') : h('noPlan')}`} style={{ flex: 1, minHeight: 77, borderRadius: 13, borderWidth: 1, borderColor: isToday ? colors.accent : 'transparent', backgroundColor: isToday ? colors.surface : 'transparent', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <Label muted size={10}>{weekday.toUpperCase()}</Label><Label bold={isToday} size={17}>{Number(date.slice(-2))}</Label>
            {completedHere ? <Ionicons name="checkmark" size={13} color={colors.good} /> : <View style={{ width: day?.day ? 5 : 10, height: day?.day ? 5 : 2, marginVertical: day?.day ? 4 : 5.5, backgroundColor: day?.day ? colors.accent : colors.border, borderRadius: 3 }} />}
          </View>;
        })}
      </View>
      {scheduled?.exception ? <Button title={t('undoRest')} secondary onPress={() => run(r => r.rest(today, null))} /> : scheduled?.day && !active && !doneToday && <Button title={t('extraRest')} secondary icon="moon-outline" onPress={() => setRestOpen(true)} />}
    </View>

    {upcoming?.plan?.day && <MotionPressable accessibilityRole="button" accessibilityLabel={`${h('upcoming')}: ${localize(upcoming.plan.day.name, language)}. ${t('plans')}`} onPress={() => router.navigate('/plans')} style={[styles.row, { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 17 }]}>
      <View style={{ width: 44, height: 44, backgroundColor: colors.raised, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="calendar-outline" color={colors.accent} size={22} /></View>
      <View style={{ flex: 1, gap: 3 }}><Label size={9} muted style={{ letterSpacing: 1.3 }}>{h('upcoming')} · {dateLabel(upcoming.date)}</Label><Label size={15} bold>{localize(upcoming.plan.day.name, language)}</Label></View>
      <Ionicons name="chevron-forward" color={colors.muted} size={17} />
    </MotionPressable>}

    <MotionPressable accessibilityRole="button" accessibilityLabel={t('character')} onPress={() => router.navigate('/profile')} style={[styles.row, { gap: 16 }]}>
      <View style={{ width: 53, height: 57, borderRadius: 13, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 1 }}><Label muted size={8} style={{ letterSpacing: 1 }}>{t('level').toUpperCase()}</Label><Label bold size={23} style={{ color: colors.accent, fontVariant: ['tabular-nums'] }}>{String(xp.level).padStart(2, '0')}</Label></View>
      <View style={{ flex: 1, gap: 9 }}><View style={[styles.row, { justifyContent: 'space-between' }]}><Label size={14} bold>{h('progress')}</Label><Label size={10} muted>{xp.current}/{xp.required} XP</Label></View><Progress fraction={xp.fraction} /></View>
    </MotionPressable>

    <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 14, gap: 8 }}>
      <View style={[styles.row, { justifyContent: 'space-between' }]}><Label bold size={16}>{h('history')}</Label><MotionPressable accessibilityRole="button" accessibilityLabel={h('open')} onPress={() => router.navigate('/tracker')} style={{ minHeight: 44, justifyContent: 'center' }}><Label size={12} style={{ color: colors.accent }}>{h('open')} ↗</Label></MotionPressable></View>
      {completed.length ? <><Label size={11} muted>{h('allTime')} · {completed.length} {t('sessions').toLowerCase()} · {data.sets.filter(set => completed.some(s => s.id === set.sessionId)).length} {t('sets').toLowerCase()}</Label>
        {completed.slice(0, 2).map(session => <View key={session.id} style={[styles.row, { paddingVertical: 9 }]}><Ionicons name="checkmark-circle-outline" size={19} color={colors.good} /><View style={{ flex: 1 }}><Label size={14}>{localize(session.dayName, language)}</Label><Label size={11} muted>{dateLabel(session.date)}</Label></View></View>)}
      </> : <Label size={12} muted>{h('empty')}</Label>}
    </View>
    <Sheet visible={restOpen} title={t('extraRest')} close={() => setRestOpen(false)}><Label muted>{t('restPreview')}</Label><View style={styles.wrap}><Chip title={t('shift')} active={mode === 'shift'} onPress={() => setMode('shift')} /><Chip title={t('keep')} active={mode === 'keep'} onPress={() => setMode('keep')} /></View>{scheduleRows(previewRests)}<Button title={t('confirmRest')} onPress={() => { if (run(r => r.rest(today, mode))) setRestOpen(false); }} /></Sheet>
    <ExerciseDetails exercise={selectedExercise} close={() => setSelectedExercise(null)} />
  </Screen>;
}
