import { useState } from 'react';
import { Image, View, type ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { exerciseMedia } from '../content/exerciseMedia';
import { useDesign } from './theme';
import { exerciseDemos } from '../content/exerciseDemos';
import { DemoFrame } from './DemoFrame';

// Bundled static illustrations; they are not animated technique demonstrations.
export function ExerciseImage({ exerciseId, size = 76, style, bare = false }: { exerciseId: string; size?: number; style?: ViewStyle; bare?: boolean }) {
  const { colors } = useDesign();
  const [failedId, setFailedId] = useState<string | null>(null);
  const source = exerciseMedia[exerciseId]?.frames[0];
  return <View accessible={false} importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[{ width: size, height: size, flexShrink: 0, borderRadius: 14, overflow: 'hidden', backgroundColor: bare ? 'transparent' : colors.artwork, alignItems: 'center', justifyContent: 'center' }, style]}>
    {exerciseDemos[exerciseId] ? <DemoFrame exerciseId={exerciseId} /> : source && failedId !== exerciseId ? <Image source={source} resizeMode="contain" fadeDuration={0} onError={() => setFailedId(exerciseId)} style={{ width: '94%', height: '94%' }} /> : <Ionicons name="barbell-outline" size={Math.min(38, size / 2)} color="#BACBDF" />}
  </View>;
}
