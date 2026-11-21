import { View } from 'react-native';

// Original code-native brand mark, not an exercise technique illustration.
export function AtlasMark({ color, size = 24 }: { color: string; size?: number }) {
  return <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, overflow: 'hidden' }}>
    <View style={{ position: 'absolute', width: size * 0.16, height: size * 0.85, backgroundColor: color, left: size * 0.25, top: size * 0.08, transform: [{ rotate: '25deg' }] }} />
    <View style={{ position: 'absolute', width: size * 0.16, height: size * 0.85, backgroundColor: color, right: size * 0.22, top: size * 0.08, transform: [{ rotate: '-25deg' }] }} />
    <View style={{ position: 'absolute', width: size * 0.37, height: size * 0.12, backgroundColor: color, left: size * 0.26, bottom: size * 0.18 }} />
  </View>;
}
