import { useEffect, type PropsWithChildren } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useAtlas } from '../core/store';
import { tokens } from './theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export function useMotionPreference() {
  const preference = useAtlas(s => s.data?.preferences.reducedMotion);
  const system = useReducedMotion();
  return !!preference || system;
}

export function MotionPressable({ style, children, disabled, onPressIn, onPressOut, ...props }: PropsWithChildren<Omit<PressableProps, 'style' | 'children'> & { style?: StyleProp<ViewStyle> }>) {
  const reduced = useMotionPreference();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(disabled ? 0.4 : 1);
  useEffect(() => { opacity.value = withTiming(disabled ? 0.4 : 1, { duration: reduced ? 0 : tokens.motion.state }); }, [disabled, reduced, opacity]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  return <AnimatedPressable {...props} disabled={disabled} style={[style, animated]}
    onPressIn={event => { scale.value = withTiming(reduced ? 1 : 0.975, { duration: reduced ? 0 : tokens.motion.press }); onPressIn?.(event); }}
    onPressOut={event => { scale.value = reduced ? 1 : withSpring(1, { damping: 22, stiffness: 320, mass: 0.7 }); onPressOut?.(event); }}>{children}</AnimatedPressable>;
}

export function Reveal({ children, identity }: PropsWithChildren<{ identity: string }>) {
  const reduced = useMotionPreference();
  const amount = useSharedValue(1);
  useEffect(() => {
    if (reduced) { amount.value = 1; return; }
    amount.value = 0;
    amount.value = withTiming(1, { duration: tokens.motion.panel });
  }, [identity, reduced, amount]);
  const style = useAnimatedStyle(() => ({ opacity: 0.75 + amount.value * 0.25, transform: [{ translateY: (1 - amount.value) * 6 }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}
