import { View } from 'react-native';
import { localize, type Exercise, type Program } from '../../domain/models';
import { Card, Label, styles } from '../../design-system/ui';
import { useDesign } from '../../design-system/theme';
import { builderText } from './strings';
import { ExerciseImage } from '../../design-system/ExerciseImage';

export function ProgramPreview({ program, exercises }: { program: Program; exercises: Exercise[] }) {
  const { language, colors, t } = useDesign();
  const b = (key: Parameters<typeof builderText>[1]) => builderText(language, key);
  return <>
    <Label muted>{localize(program.description, language)}</Label>
    {program.days.map((day, index) => <Card key={day.id}>
      <Label size={11} bold style={{ color: colors.accent }}>{String(index + 1).padStart(2, '0')} · {b('days').toUpperCase()}</Label>
      <Label bold size={20}>{localize(day.name, language)}</Label>
      {day.exercises.map(e => {
        const exercise = exercises.find(x => x.id === e.exerciseId);
        return <View key={e.exerciseId} style={[styles.row, { alignItems: 'flex-start' }]}>
          <ExerciseImage exerciseId={e.exerciseId} size={52} />
          <View style={{ flex: 1, gap: 4 }}>
          <Label bold size={14}>{exercise ? localize(exercise.name, language) : b('notFound')}</Label>
          <Label muted size={12}>{e.sets} × {e.reps}{e.weight !== undefined ? ` · ${e.weight} kg` : ''} · {t('restTimer')} {e.restSeconds}s</Label>
          {!!e.notes && <Label size={12} muted>{e.notes}</Label>}
          </View>
        </View>;
      })}
    </Card>)}
    <Label bold>{b('cycle')} · {program.cycle.length}</Label>
    <View style={styles.wrap}>{program.cycle.map((dayId, index) => <View key={index} style={{ padding: 10, borderRadius: 12, backgroundColor: dayId ? colors.raised : colors.surface, maxWidth: '100%' }}>
      <Label size={12}>{index + 1} · {dayId ? localize(program.days.find(d => d.id === dayId)!.name, language) : b('recovery')}</Label>
    </View>)}</View>
  </>;
}
