import { useState } from 'react';
import { Image, View } from 'react-native';
import { exerciseDemos } from '../content/exerciseDemos';
export function DemoFrame({ exerciseId, frame = 0 }: { exerciseId: string; frame?: number }) {
  const [width, setWidth] = useState(0);
  const demo = exerciseDemos[exerciseId];
  if (!demo) return null;
  return <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ width: '100%', aspectRatio: 1, overflow: 'hidden', borderRadius: 14 }}>
    {width > 0 && <Image accessible={false} source={demo.source} resizeMode="stretch" fadeDuration={0} style={{ position: 'absolute', width: width * demo.frames, height: width, left: -Math.min(demo.frames - 1, Math.max(0, frame)) * width, top: 0 }} />}
  </View>;
}
