import { Linking, View } from 'react-native';
import { useAtlas } from '../../core/store';
import { localize, type Exercise } from '../../domain/models';
import { exerciseMedia, mediaCredit, mediaLicenseUrl, mediaSourceUrl } from '../../content/exerciseMedia';
import { ExerciseImage } from '../../design-system/ExerciseImage';
import { Button, Label, Sheet, styles } from '../../design-system/ui';
import { useDesign } from '../../design-system/theme';
import { muscleNames } from '../home/strings';
import { mediaText } from './mediaStrings';
import { exerciseDemos } from '../../content/exerciseDemos';
import { ExerciseDemo } from './ExerciseDemo';

export function MediaCredits() {
  const { language } = useDesign();
  async function open(url: string) {
    try { await Linking.openURL(url); } catch (error) { useAtlas.setState({ error: String(error) }); }
  }
  return <View style={{ gap: 10 }}>
    <Label size={12} muted>{mediaCredit}</Label>
    <Label size={11} muted>{mediaText(language, 'creditNote')}</Label>
    <View style={styles.wrap}><Button secondary title={mediaText(language, 'source')} onPress={() => void open(mediaSourceUrl)} /><Button secondary title="CC BY-SA 4.0 ↗" onPress={() => void open(mediaLicenseUrl)} /></View>
  </View>;
}

export function ExerciseDetails({ exercise, close }: { exercise: Exercise | null; close: () => void }) {
  const { colors, language, t } = useDesign();
  return <Sheet visible={!!exercise} title={exercise ? localize(exercise.name, language) : ''} close={close}>
    {exercise && <>
      {exerciseDemos[exercise.id] ? <ExerciseDemo key={exercise.id} exerciseId={exercise.id} /> : <View style={{ backgroundColor: colors.artwork, borderRadius: 20, padding: 16, gap: 8, alignItems: 'center' }}>
        <View style={{ alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}><Label size={10} style={{ color: '#BACBDF', letterSpacing: 1 }}>{mediaText(language, 'illustration').toUpperCase()}</Label><Label size={10} style={{ color: '#BACBDF' }}>ATLAS</Label></View>
        <ExerciseImage exerciseId={exercise.id} size={230} bare style={{ maxWidth: '100%' }} />
        {!exerciseMedia[exercise.id] && <Label size={12} style={{ color: '#BACBDF' }}>{mediaText(language, 'missing')}</Label>}
      </View>}
      <View style={styles.wrap}><Label size={12} style={{ color: colors.accent }}>{t(exercise.equipment)}</Label><Label size={12} muted>{exercise.muscles.map(m => muscleNames[m] ? localize(muscleNames[m]!, language) : m).join(' · ')}</Label></View>
      <Label bold size={16}>{mediaText(language, 'technique')}</Label>
      <Label size={16}>{localize(exercise.instruction, language)}</Label>
      <Label muted size={12}>{t('sourceNote')}</Label>
      {!!exerciseMedia[exercise.id] && !exerciseDemos[exercise.id] && <MediaCredits />}
    </>}
  </Sheet>;
}
