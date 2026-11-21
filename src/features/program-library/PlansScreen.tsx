import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAtlas } from '../../core/store';
import { useToday } from '../../core/useToday';
import { localize } from '../../domain/models';
import { addDays } from '../../domain/scheduling';
import { editProgramDraft, newProgramDraft, type ProgramDraft } from '../../domain/programBuilder';
import { Button, Card, Chip, Label, Screen, Sheet, styles } from '../../design-system/ui';
import { useDesign } from '../../design-system/theme';
import { ProgramBuilder, ProgramPreview, builderText } from '../program-builder';
import { MotionPressable, Reveal } from '../../design-system/motion';
import { featureText } from '../../localization/features';

export default function PlansScreen() {
  const { data: snapshot, run } = useAtlas();
  const data = snapshot!;
  const { colors, language, t } = useDesign();
  const b = (key: Parameters<typeof builderText>[1]) => builderText(language, key);
  const today = useToday();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [builder, setBuilder] = useState<ProgramDraft | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const selected = data.programs.find(p => p.id === selectedId);
  const activationDate = data.sessions.some(s => s.date >= today) ? addDays(today, 1) : today;
  const selectedActivation = data.activations.filter(a => a.program.id === selectedId).sort((a, b) => b.date.localeCompare(a.date))[0];
  return <Screen title={t('programs')} subtitle={b('intro')}>
    <Button title={b('create')} icon="add" onPress={() => setBuilder(newProgramDraft(data.profile.name))} />
    {(['user', 'catalog'] as const).map(owner => {
      const list = data.programs.filter(p => p.owner === owner);
      return list.length > 0 && <View key={owner} style={{ gap: 16 }}>
        <View style={[styles.row, { justifyContent: 'space-between' }]}><Label size={17} bold>{b(owner === 'user' ? 'myPrograms' : 'templates')}</Label><Label muted size={12}>{list.length}</Label></View>
        {list.map(program => <Reveal key={program.id} identity={program.id}><Card>
          <View style={[styles.row, { justifyContent: 'space-between' }]}><Label size={10} bold style={{ color: colors.accent, letterSpacing: 1.4 }}>{program.owner === 'user' ? b('myPrograms').toUpperCase() : t('template').toUpperCase()}</Label><MotionPressable accessibilityRole="button" accessibilityLabel={featureText(language, 'splitSettings') + ': ' + localize(program.name, language)} onPress={() => setBuilder(editProgramDraft(program, language, program.owner === 'catalog'))} style={styles.iconButton}><Ionicons name="ellipsis-horizontal" size={23} color={colors.accent} /></MotionPressable></View>
          <MotionPressable accessibilityRole="button" accessibilityLabel={localize(program.name, language)} onPress={() => { setSelectedId(program.id); setStartIndex(0); setSavedId(null); }} style={{ gap: 12 }}>
          <Label bold size={25}>{localize(program.name, language)}</Label>
          <View style={[styles.row, { justifyContent: 'space-between' }]}><Label muted size={12}>{program.cycle.filter(Boolean).length} {t('days')} / {program.cycle.length} {t('cycle')}</Label><Ionicons name="arrow-forward" color={colors.accent} size={21} /></View>
          <View style={{ flexDirection: 'row', gap: 3 }}>{program.cycle.map((day, index) => <View key={index} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: day ? colors.accent : colors.raised }} />)}</View>
          </MotionPressable></Card></Reveal>)}
      </View>;
    })}
    <Sheet title={selected ? localize(selected.name, language) : ''} visible={!!selected && !builder} close={() => setSelectedId(null)}>
      {selected && <>
        {savedId === selected.id && <Card><Label bold style={{ color: colors.good }}>{b('saved')} · v{selected.version}</Label><Label muted size={12}>{b('savedNote')}</Label></Card>}
        <View style={styles.wrap}><Label muted size={12}>{b('libraryVersion')} · v{selected.version}</Label>{selectedActivation && <Label muted size={12}>{b('currentVersion')} · v{selectedActivation.program.version}</Label>}</View>
        {selectedActivation && selectedActivation.program.version < selected.version && <Label style={{ color: colors.accent }} size={13}>{b('updatedAvailable')}</Label>}
        <Button title={selected.owner === 'catalog' ? t('customize') : b('edit')} secondary icon="create-outline" onPress={() => setBuilder(editProgramDraft(selected, language, selected.owner === 'catalog'))} />
        {selected.owner === 'user' && <Button title={b('duplicate')} secondary icon="copy-outline" onPress={() => setBuilder(editProgramDraft(selected, language, true))} />}
        <ProgramPreview program={selected} exercises={data.exercises} />
        <Label bold>{t('planDate')}: {activationDate}</Label>
        <View style={styles.wrap}>{selected.cycle.map((dayId, index) => <Chip key={index} title={`${index + 1} · ${dayId ? localize(selected.days.find(d => d.id === dayId)!.name, language) : b('recovery')}`} active={startIndex === index} onPress={() => setStartIndex(index)} />)}</View>
        <Button title={t('activate')} icon="play-outline" onPress={() => { if (run(r => r.activate(selected.id, startIndex, today))) { setSelectedId(null); router.navigate('/'); } }} />
        <Label muted size={11}>{selected.owner === 'catalog' ? t('sourceNote') : b('customNote')}</Label>
      </>}
    </Sheet>
    {builder && <ProgramBuilder initial={builder} onClose={() => setBuilder(null)} onSaved={program => { setSelectedId(program.id); setSavedId(program.id); setStartIndex(0); setBuilder(null); }} />}
  </Screen>;
}
