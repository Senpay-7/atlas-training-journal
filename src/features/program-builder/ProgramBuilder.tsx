import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAtlas } from '../../core/store';
import { localize, type Program } from '../../domain/models';
import { builderId, draftPrescription, exerciseChoices, finishProgramDraft, moveItem, removeDraftDay, validateProgramDraft, type DraftDay, type ProgramDraft } from '../../domain/programBuilder';
import { Button, Card, Chip, Field, Label, Sheet, styles } from '../../design-system/ui';
import { useDesign } from '../../design-system/theme';
import { builderText } from './strings';
import { ProgramPreview } from './ProgramPreview';
import { ExerciseImage } from '../../design-system/ExerciseImage';

const steps = ['details', 'days', 'cycle', 'preview'] as const;
type Step = typeof steps[number];
type Picker = { dayId: string; replacing?: string };

function IconAction({ name, label, disabled, onPress }: { name: keyof typeof Ionicons.glyphMap; label: string; disabled?: boolean; onPress: () => void }) {
  const { colors } = useDesign();
  return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} style={[styles.iconButton, { opacity: disabled ? 0.25 : 1 }]}><Ionicons name={name} size={20} color={colors.text} /></Pressable>;
}

export function ProgramBuilder({ initial, onClose, onSaved }: { initial: ProgramDraft; onClose: () => void; onSaved: (program: Program) => void }) {
  const { data, run } = useAtlas();
  const { colors, language, t } = useDesign();
  const b = (key: Parameters<typeof builderText>[1]) => builderText(language, key);
  const [draft, setDraft] = useState(initial);
  const [step, setStep] = useState<Step>('details');
  const [dayId, setDayId] = useState(initial.days[0]?.id ?? '');
  const [picker, setPicker] = useState<Picker | null>(null);
  const [query, setQuery] = useState('');
  const [equipment, setEquipment] = useState('all');
  const [cycleSlot, setCycleSlot] = useState<number | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [deleteDay, setDeleteDay] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ before: ProgramDraft; after: ProgramDraft } | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [conflict, setConflict] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const issues = validateProgramDraft(draft, data!.exercises);
  const activeDay = draft.days.find(d => d.id === dayId) ?? draft.days[0];
  const preview = !issues.length ? finishProgramDraft(draft, language, data!.exercises) : null;
  const dirty = JSON.stringify(initial) !== JSON.stringify(draft);
  function close() { if (dirty) setConfirmLeave(true); else onClose(); }
  function changeStep(next: Step) { setStep(next); scroll.current?.scrollTo({ y: 0, animated: false }); }
  function updateDay(update: (day: DraftDay) => DraftDay) { if (activeDay) setDraft(prev => ({ ...prev, days: prev.days.map(day => day.id === activeDay.id ? update(day) : day) })); }
  function destructiveUpdate(next: ProgramDraft) { setUndo({ before: draft, after: next }); setDraft(next); }
  function openPicker(value: Picker) { setQuery(''); setEquipment('all'); setPicker(value); }
  function save(asCopy = false) {
    setShowErrors(true);
    if (issues.length) {
      const issue = issues[0]!;
      if (issue.path === 'name') changeStep('details');
      else if (issue.code === 'unscheduledDay' || issue.path === 'cycle') changeStep('cycle');
      else {
        const day = draft.days.find(d => issue.path.startsWith(`days.${d.id}`));
        if (day) setDayId(day.id);
        changeStep('days');
      }
      return;
    }
    const program = finishProgramDraft(draft, language, data!.exercises);
    const toSave = asCopy ? { ...program, id: `user:${builderId()}`, version: 1, parentId: program.id } : program;
    let saved: Program | undefined;
    const success = run(repo => {
      try { saved = repo.saveProgram(toSave); }
      catch (error) { if (error instanceof Error && error.message === 'PROGRAM_VERSION_CONFLICT') { setConflict(true); return; } throw error; }
    });
    if (success && saved) onSaved(saved);
  }
  function errorAt(path: string) {
    const issue = showErrors && issues.find(i => i.path === path);
    return issue ? <View accessibilityRole="alert"><Label size={12} style={{ color: colors.danger }}>{b(issue.code)}</Label></View> : null;
  }
  const replacing = data!.exercises.find(e => e.id === picker?.replacing);
  const choices = picker ? exerciseChoices(data!.exercises, query, equipment, draft.days.find(d => d.id === picker.dayId)?.exercises.map(e => e.exerciseId) ?? [], replacing) : [];
  return <Modal visible onRequestClose={close} animationType="none">
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ width: '100%', maxWidth: 840, alignSelf: 'center', flex: 1 }}>
          <View style={[styles.row, { paddingHorizontal: 18, paddingVertical: 10 }]}>
            <IconAction name="close" label={t('close')} onPress={close} />
            <View style={{ flex: 1 }}><Label size={18} bold>{b('builder')}</Label><Label size={11} muted>{draft.name || b('intro')}</Label></View>
          </View>
          <View style={{ flexDirection: 'row', paddingHorizontal: 14, gap: 4, paddingBottom: 12 }}>
            {steps.map((key, index) => <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: key === step }} accessibilityLabel={b(key)} onPress={() => changeStep(key)} style={{ flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderColor: key === step ? colors.accent : colors.border, alignItems: 'center', gap: 4 }}>
              <Label size={11} style={{ color: key === step ? colors.accent : colors.muted }}>{String(index + 1).padStart(2, '0')}</Label><Label size={12} bold={key === step}>{b(key)}</Label>
            </Pressable>)}
          </View>
          <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 20 }}>
            {showErrors && issues.length > 0 && <Card><Label style={{ color: colors.danger }}>{b('reviewErrors')}</Label></Card>}
            {conflict && <Card><Label style={{ color: colors.danger }}>{b('conflict')}</Label><Button title={b('saveCopy')} onPress={() => save(true)} /></Card>}
            {undo && draft === undo.after && <View style={styles.row}><Label muted style={{ flex: 1 }}>{t('undo')}</Label><Button title={t('undo')} secondary onPress={() => { setDraft(undo.before); setUndo(null); }} /></View>}
            {step === 'details' && <>
              <Card><Label size={23} bold>{b('intro')}</Label><Label size={13} muted>{b('versionNote')}</Label></Card>
              <Field label={b('name')} value={draft.name} maxLength={100} onChangeText={name => setDraft(prev => ({ ...prev, name }))} />{errorAt('name')}
              <Field label={b('description')} value={draft.description} multiline maxLength={2000} style={{ minHeight: 100, textAlignVertical: 'top' }} onChangeText={description => setDraft(prev => ({ ...prev, description }))} />
              <Label size={12} muted>{b('draftNote')}</Label>
            </>}
            {step === 'days' && <>
              <View style={styles.wrap}>{draft.days.map((day, index) => <Chip key={day.id} title={`${index + 1} · ${day.name || b('newDay')}`} active={activeDay?.id === day.id} onPress={() => setDayId(day.id)} />)}</View>
              <Button title={b('addDay')} secondary icon="add" disabled={draft.cycle.length >= 56} onPress={() => {
                const day: DraftDay = { id: `day:${builderId()}`, name: `${b('newDay')} ${draft.days.length + 1}`, exercises: [] };
                setDraft(prev => ({ ...prev, days: [...prev.days, day], cycle: [...prev.cycle, day.id] })); setDayId(day.id);
              }} />
              {activeDay && <>
                <Field label={b('dayName')} maxLength={100} value={activeDay.name} onChangeText={name => updateDay(day => ({ ...day, name }))} />{errorAt(`days.${activeDay.id}.name`)}
                <View style={[styles.row, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row' }}><IconAction name="arrow-up" label={`${b('up')} · ${activeDay.name}`} disabled={draft.days[0]?.id === activeDay.id} onPress={() => setDraft(prev => ({ ...prev, days: moveItem(prev.days, prev.days.findIndex(d => d.id === activeDay.id), -1) }))} /><IconAction name="arrow-down" label={`${b('down')} · ${activeDay.name}`} disabled={draft.days.at(-1)?.id === activeDay.id} onPress={() => setDraft(prev => ({ ...prev, days: moveItem(prev.days, prev.days.findIndex(d => d.id === activeDay.id), 1) }))} /></View>
                  <IconAction name="trash-outline" label={b('removeDay')} disabled={draft.days.length < 2} onPress={() => setDeleteDay(activeDay.id)} />
                </View>
                <Label muted size={11}>{b('moveWorkoutNote')}</Label>
                {errorAt(`days.${activeDay.id}`)}
                {!activeDay.exercises.length && <Card><Label muted>{b('emptyDay')}</Label></Card>}
                {activeDay.exercises.map((entry, index) => {
                  const exercise = data!.exercises.find(e => e.id === entry.exerciseId);
                  const name = exercise ? localize(exercise.name, language) : b('notFound');
                  const path = `days.${activeDay.id}.${entry.exerciseId}`;
                  const update = (field: keyof typeof entry, value: string) => updateDay(day => ({ ...day, exercises: day.exercises.map(e => e.exerciseId === entry.exerciseId ? { ...e, [field]: value } : e) }));
                  return <Card key={entry.exerciseId}>
                    <View style={styles.row}><Label bold style={{ color: colors.accent }}>{String(index + 1).padStart(2, '0')}</Label><Label size={18} bold style={{ flex: 1 }}>{name}</Label></View>
                    <View style={[styles.row, { justifyContent: 'space-between' }]}><Label size={12} muted>{exercise ? t(exercise.equipment) : ''}</Label><View style={{ flexDirection: 'row' }}>
                      <IconAction name="arrow-up" label={`${b('up')} · ${name}`} disabled={index === 0} onPress={() => updateDay(day => ({ ...day, exercises: moveItem(day.exercises, index, -1) }))} />
                      <IconAction name="arrow-down" label={`${b('down')} · ${name}`} disabled={index === activeDay.exercises.length - 1} onPress={() => updateDay(day => ({ ...day, exercises: moveItem(day.exercises, index, 1) }))} />
                      <IconAction name="trash-outline" label={`${b('remove')} · ${name}`} onPress={() => destructiveUpdate({ ...draft, days: draft.days.map(day => day.id === activeDay.id ? { ...day, exercises: day.exercises.filter(e => e.exerciseId !== entry.exerciseId) } : day) })} />
                    </View></View>
                    <View style={styles.row}><Field label={t('sets')} value={entry.sets} keyboardType="number-pad" onChangeText={value => update('sets', value)} /><Field label={t('reps')} value={entry.reps} keyboardType="number-pad" onChangeText={value => update('reps', value)} /></View>
                    {errorAt(`${path}.sets`)}{errorAt(`${path}.reps`)}
                    <Field label={b('rest')} value={entry.restSeconds} keyboardType="number-pad" onChangeText={value => update('restSeconds', value)} />{errorAt(`${path}.restSeconds`)}
                    <Field label={b('weight')} value={entry.weight} keyboardType="decimal-pad" placeholder="—" onChangeText={value => update('weight', value)} />{errorAt(`${path}.weight`)}
                    <Field label={b('notes')} value={entry.notes} multiline maxLength={500} onChangeText={value => update('notes', value)} />
                    <Button title={`${b('replace')} · ${name}`} secondary icon="swap-horizontal" onPress={() => openPicker({ dayId: activeDay.id, replacing: entry.exerciseId })} />
                  </Card>;
                })}
                <Button title={b('addExercise')} icon="add" onPress={() => openPicker({ dayId: activeDay.id })} />
              </>}
            </>}
            {step === 'cycle' && <>
              <Label muted size={13}>{b('cycleNote')}</Label>{errorAt('cycle')}
              {draft.days.map(day => <View key={day.id}>{errorAt(`days.${day.id}`)}</View>)}
              {draft.cycle.map((id, index) => <View key={index} style={[styles.row, { paddingVertical: 8, borderBottomWidth: 1, borderColor: colors.border, gap: 4 }]}>
                <Pressable accessibilityRole="button" accessibilityLabel={`${b('position')} ${index + 1}: ${id ? draft.days.find(d => d.id === id)?.name : b('recovery')}`} onPress={() => setCycleSlot(index)} style={{ flex: 1, padding: 8, gap: 3 }}>
                  <Label size={11} muted>{b('position')} {index + 1}</Label><Label size={14} bold style={{ color: id ? colors.accent : colors.muted }}>{id ? draft.days.find(d => d.id === id)?.name : b('recovery')} ⌄</Label>
                </Pressable>
                <IconAction name="arrow-up" label={`${b('up')} · ${b('position')} ${index + 1}`} disabled={index === 0} onPress={() => setDraft(prev => ({ ...prev, cycle: moveItem(prev.cycle, index, -1) }))} />
                <IconAction name="arrow-down" label={`${b('down')} · ${b('position')} ${index + 1}`} disabled={index === draft.cycle.length - 1} onPress={() => setDraft(prev => ({ ...prev, cycle: moveItem(prev.cycle, index, 1) }))} />
                <IconAction name="trash-outline" label={`${b('remove')} · ${b('position')} ${index + 1}`} disabled={draft.cycle.length === 1} onPress={() => destructiveUpdate({ ...draft, cycle: draft.cycle.filter((_, i) => i !== index) })} />
              </View>)}
              <Button title={b('addSlot')} secondary icon="add" disabled={draft.cycle.length >= 56} onPress={() => { setDraft(prev => ({ ...prev, cycle: [...prev.cycle, null] })); setCycleSlot(draft.cycle.length); }} />
              <Label muted size={11}>{b('cycleLimit')}</Label>
            </>}
            {step === 'preview' && (preview ? <><Label size={26} bold>{localize(preview.name, language)}</Label><ProgramPreview program={preview} exercises={data!.exercises} /><Label muted size={12}>{b('versionNote')}</Label></> : <Card><Label>{b('reviewErrors')}</Label>{issues.map((issue, i) => <Label key={i} muted size={13}>• {b(issue.code)}</Label>)}<Button title={b('back')} onPress={() => save()} /></Card>)}
          </ScrollView>
          <View style={[styles.row, { padding: 16, borderTopWidth: 1, borderColor: colors.border }]}>
            {step !== 'details' && <Button title={b('back')} secondary onPress={() => changeStep(steps[steps.indexOf(step) - 1]!)} />}
            <View style={{ flex: 1 }}><Button title={step === 'preview' ? b('save') : b('next')} icon={step === 'preview' ? 'checkmark' : 'arrow-forward'} onPress={() => step === 'preview' ? save() : changeStep(steps[steps.indexOf(step) + 1]!)} /></View>
          </View>
        </View>
      </KeyboardAvoidingView>
      <Sheet visible={!!picker} title={picker?.replacing ? b('replace') : b('addExercise')} close={() => setPicker(null)}>
        {!!picker?.replacing && <Label muted size={12}>{b('replacementNote')}</Label>}
        <Field label={b('search')} value={query} onChangeText={setQuery} />
        <View style={styles.wrap}>{(['all', 'bodyweight', 'dumbbell', 'barbell', 'machine'] as const).map(key => <Chip key={key} title={t(key)} active={equipment === key} onPress={() => setEquipment(key)} />)}</View>
        {!choices.length && <Label muted>{b('emptyPicker')}</Label>}
        {choices.map(exercise => <Pressable key={exercise.id} accessibilityRole="button" accessibilityLabel={localize(exercise.name, language)} onPress={() => {
          if (!picker) return;
          setDraft(prev => ({ ...prev, days: prev.days.map(day => day.id !== picker.dayId ? day : { ...day, exercises: picker.replacing ? day.exercises.map(e => e.exerciseId === picker.replacing ? { ...e, exerciseId: exercise.id } : e) : [...day.exercises, draftPrescription(exercise.id)] }) }));
          setPicker(null);
        }}><Card style={{ flexDirection: 'row', alignItems: 'center' }}><ExerciseImage exerciseId={exercise.id} size={62} /><View style={{ flex: 1, gap: 5 }}><Label bold>{localize(exercise.name, language)}</Label><Label size={12} muted>{t(exercise.equipment)}</Label>{replacing && <Label size={12} style={{ color: exercise.pattern === replacing.pattern ? colors.good : colors.muted }}>{b(exercise.pattern === replacing.pattern ? 'samePattern' : 'differentPattern')}</Label>}</View></Card></Pressable>)}
      </Sheet>
      <Sheet visible={cycleSlot !== null} title={b('pickSlot')} close={() => setCycleSlot(null)}>
        {[null, ...draft.days.map(d => d.id)].map(id => <Button key={id ?? 'rest'} title={id ? draft.days.find(d => d.id === id)!.name || b('newDay') : b('recovery')} secondary onPress={() => { setDraft(prev => ({ ...prev, cycle: prev.cycle.map((value, i) => i === cycleSlot ? id : value) })); setCycleSlot(null); }} />)}
      </Sheet>
      <Sheet visible={confirmLeave} title={b('discardTitle')} close={() => setConfirmLeave(false)}><Label>{b('discardNote')}</Label><Button title={b('keepEditing')} onPress={() => setConfirmLeave(false)} /><Button title={b('discard')} secondary onPress={onClose} /></Sheet>
      <Sheet visible={deleteDay !== null} title={b('removeDay')} close={() => setDeleteDay(null)}><Label>{b('removeDayNote')}</Label><Button title={b('removeDay')} onPress={() => { if (deleteDay) destructiveUpdate(removeDraftDay(draft, deleteDay)); setDeleteDay(null); }} /><Button title={t('cancel')} secondary onPress={() => setDeleteDay(null)} /></Sheet>
    </SafeAreaView>
  </Modal>;
}
