import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAtlas } from '../../core/store';
import { localize, type Exercise } from '../../domain/models';
import { Card, Chip, Field, Label, Screen, styles } from '../../design-system/ui';
import { useDesign } from '../../design-system/theme';
import { ExerciseImage } from '../../design-system/ExerciseImage';
import { ExerciseDetails } from './ExerciseDetails';
import { muscleNames } from '../home/strings';
export default function ExploreScreen() {
  const data = useAtlas(s => s.data)!;
  const { colors, language, t } = useDesign();
  const [query, setQuery] = useState('');
  const [equipment, setEquipment] = useState('all');
  const [selected, setSelected] = useState<Exercise | null>(null);
  const normalize = (s: string) => s.toLowerCase().replaceAll('ё', 'е').normalize('NFKD');
  const filtered = data.exercises.filter(e => (equipment === 'all' || e.equipment === equipment) && normalize([...Object.values(e.name), ...e.aliases, ...e.muscles].join(' ')).includes(normalize(query)));
  return <Screen title={t('library')} subtitle={t('librarySub')}>
    <Field label={t('search')} value={query} onChangeText={setQuery} placeholder="Bench press, жим…" />
    <View style={styles.wrap}>{(['all', 'bodyweight', 'dumbbell', 'barbell', 'machine'] as const).map(key => <Chip key={key} title={t(key)} active={equipment === key} onPress={() => setEquipment(key)} />)}</View>
    <Label muted size={12}>{filtered.length} / {data.exercises.length}</Label>
    {filtered.map(e => <Pressable key={e.id} accessibilityRole="button" accessibilityLabel={localize(e.name, language)} onPress={() => setSelected(e)}><Card style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 14 }}><ExerciseImage exerciseId={e.id} size={78} /><View style={{ flex: 1, gap: 5 }}><Label bold size={15}>{localize(e.name, language)}</Label><Label size={11} style={{ color: colors.accent }}>{t(e.equipment)}</Label><Label muted size={11}>{e.muscles.map(m => muscleNames[m] ? localize(muscleNames[m]!, language) : m).join(' · ')}</Label></View><Ionicons name="chevron-forward" color={colors.muted} size={17} /></Card></Pressable>)}
    <ExerciseDetails exercise={selected} close={() => setSelected(null)} />
  </Screen>;
}
