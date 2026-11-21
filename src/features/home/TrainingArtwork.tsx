import { View } from 'react-native';
import { ExerciseImage } from '../../design-system/ExerciseImage';
import { useDesign } from '../../design-system/theme';

export function TrainingArtwork({ exerciseId, size = 108 }: { exerciseId: string; size?: number }) {
  const { colors } = useDesign();
  return <View accessible={false} importantForAccessibility="no-hide-descendants" pointerEvents="none" style={{ width: size, height: size * 1.075, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <View style={{ position: 'absolute', width: size * 0.88, height: size * 0.88, borderRadius: size, borderWidth: 1, borderColor: colors.artworkLine }} />
    <View style={{ position: 'absolute', width: size * 0.68, height: size * 0.68, borderRadius: size, backgroundColor: colors.artwork }} />
    <ExerciseImage exerciseId={exerciseId} size={size * 1.075} bare />
  </View>;
}
