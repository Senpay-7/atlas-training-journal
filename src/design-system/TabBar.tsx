import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ComponentProps } from 'react';
import type { Tabs } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAtlas } from '../core/store';
import { useDesign, tokens } from './theme';
import { MotionPressable, useMotionPreference } from './motion';
const routes = [
  { name: 'explore', label: 'explore', icon: 'compass-outline' },
  { name: 'plans', label: 'plans', icon: 'layers-outline' },
  { name: 'index', label: 'home', icon: 'home-outline' },
  { name: 'tracker', label: 'tracker', icon: 'barbell-outline' },
  { name: 'profile', label: 'profile', icon: 'person-outline' },
] as const;
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, t } = useDesign();
  const preset = useAtlas(s => s.data!.preferences.navigation);
  const inset = useSafeAreaInsets();
  const reduced = useMotionPreference();
  const [width, setWidth] = useState(0);
  const selectedIndex = Math.max(0, routes.findIndex(r => r.name === state.routes[state.index]?.name));
  const slot = Math.max(0, (width - 12) / 5);
  const x = useSharedValue(selectedIndex * slot);
  useEffect(() => { x.value = withTiming(selectedIndex * slot, { duration: reduced ? 0 : tokens.motion.state }); }, [selectedIndex, slot, reduced, x]);
  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return <View style={{ backgroundColor: colors.background, paddingBottom: Math.max(inset.bottom, 10), paddingHorizontal: preset === 'minimal' ? 8 : 14, paddingTop: preset === 'floating' ? 14 : 8 }}>
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', maxWidth: 620, width: '100%', alignSelf: 'center', padding: 6, borderRadius: preset === 'dynamic' ? 18 : 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass }}>
      {width > 0 && <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: slot, left: 6, top: 6, bottom: 6, borderRadius: preset === 'dynamic' ? 12 : 18, backgroundColor: colors.raised }, indicator]} />}
      {routes.map((route, index) => {
        const target = state.routes.find(r => r.name === route.name)!;
        const selected = selectedIndex === index;
        const center = index === 2;
        return <MotionPressable key={route.name} accessibilityRole="tab" accessibilityLabel={t(route.label)} accessibilityState={{ selected }}
          onPress={() => { const event = navigation.emit({ type: 'tabPress', target: target.key, canPreventDefault: true }); if (!selected && !event.defaultPrevented) navigation.navigate(route.name); }}
          style={{ flex: 1, minHeight: preset === 'minimal' ? 46 : 54, alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center', width: 30, height: 25, marginTop: center && preset === 'floating' ? -6 : 0 }}><Ionicons name={route.icon} size={center ? 25 : 21} color={selected || center ? colors.accent : colors.muted} /></View>
          {preset !== 'minimal' && <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: selected ? '600' : '400', color: selected ? colors.text : colors.muted }}>{t(route.label)}</Text>}
        </MotionPressable>;
      })}
    </View>
  </View>;
}
