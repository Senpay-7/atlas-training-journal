import React, { useEffect, type PropsWithChildren } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, TextInput, Modal, KeyboardAvoidingView, Platform, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDesign } from './theme';
import { useAtlas } from '../core/store';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, useReducedMotion } from 'react-native-reanimated';
import { MotionPressable } from './motion';
import { AtlasMark } from './AtlasMark';

export function Label({ children, muted = false, size = 15, bold = false, style }: PropsWithChildren<{ muted?: boolean; size?: number; bold?: boolean; style?: object }>) {
  const { colors } = useDesign();
  return <Text style={[{ color: muted ? colors.muted : colors.text, fontSize: size, lineHeight: size * 1.45, fontWeight: bold ? '700' : '400' }, style]}>{children}</Text>;
}
export function Screen({ children, title, subtitle, action, header }: PropsWithChildren<{ title?: string; subtitle?: string; action?: React.ReactNode; header?: React.ReactNode }>) {
  const { colors } = useDesign();
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
        {header ?? <><View style={[styles.row, { justifyContent: 'space-between', marginBottom: 20 }]}><View style={[styles.row, { gap: 8 }]}><AtlasMark color={colors.accent} size={21} /><Label bold size={13} style={{ letterSpacing: 2.6 }}>ATLAS</Label></View>{action}</View>
        <View style={{ gap: 5, marginBottom: 22 }}><Label bold size={26} style={{ letterSpacing: -0.7 }}>{title}</Label>{subtitle && <Label muted size={13}>{subtitle}</Label>}</View></>}
        <View style={{ gap: 22 }}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const { colors } = useDesign();
  return <View style={[{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 18, gap: 12 }, style]}>{children}</View>;
}
export function Button({ title, onPress, secondary = false, disabled = false, icon }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; icon?: keyof typeof Ionicons.glyphMap }) {
  const { colors } = useDesign();
  return <MotionPressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={{ minHeight: 46, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: secondary ? colors.raised : colors.button, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center' }}>
    {icon && <Ionicons name={icon} size={17} color={secondary ? colors.text : colors.buttonText} />}<Text style={{ color: secondary ? colors.text : colors.buttonText, fontSize: 14, fontWeight: '600', textAlign: 'center', flexShrink: 1 }}>{title}</Text>
  </MotionPressable>;
}
export function Chip({ title, active, onPress }: { title: string; active?: boolean; onPress: () => void }) {
  const { colors } = useDesign();
  return <MotionPressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!active }} style={{ maxWidth: '100%', minHeight: 44, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 10, backgroundColor: active ? colors.button : colors.surface, borderWidth: 1, borderColor: active ? colors.button : colors.border }}><Text style={{ color: active ? colors.buttonText : colors.muted, fontSize: 13, fontWeight: '500', flexShrink: 1 }}>{title}</Text></MotionPressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const { colors } = useDesign();
  return <View style={{ gap: 6, flex: 1 }}><Label size={12} muted>{label}</Label><TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} selectionColor={colors.accent} {...props} style={[{ minHeight: 46, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, color: colors.text, backgroundColor: colors.background, fontSize: 16 }, props.style]} /></View>;
}
export function Sheet({ visible, title, close, children }: PropsWithChildren<{ visible: boolean; title: string; close: () => void }>) {
  const { colors, t } = useDesign();
  const reduced = useAtlas(s => s.data?.preferences.reducedMotion);
  const systemReduced = useReducedMotion();
  return <Modal transparent visible={visible} onRequestClose={close} animationType={reduced || systemReduced ? 'none' : 'fade'}><View style={styles.overlay}><SafeAreaView style={[styles.sheet, { backgroundColor: colors.background }]}><View style={[styles.row, { justifyContent: 'space-between', padding: 20 }]}><Label size={21} bold style={{ flex: 1 }}>{title}</Label><Pressable accessibilityLabel={t('close')} accessibilityRole="button" onPress={close} style={styles.iconButton}><Ionicons name="close" size={26} color={colors.text} /></Pressable></View><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 18 }}>{children}</ScrollView></SafeAreaView></View></Modal>;
}
export function Progress({ fraction }: { fraction: number }) {
  const { colors } = useDesign();
  const reduced = useAtlas(s => s.data?.preferences.reducedMotion);
  const systemReduced = useReducedMotion();
  const value = useSharedValue(0);
  useEffect(() => { value.value = withTiming(Math.max(0, Math.min(1, fraction)), { duration: reduced || systemReduced ? 0 : 400 }); }, [fraction, reduced, systemReduced, value]);
  const animatedStyle = useAnimatedStyle(() => ({ width: `${value.value * 100}%` as `${number}%` }));
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }} style={{ height: 7, backgroundColor: colors.raised, borderRadius: 4, overflow: 'hidden' }}><Animated.View style={[{ height: 7, backgroundColor: colors.accent, borderRadius: 4 }, animatedStyle]} /></View>;
}
export const styles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28, width: '100%', maxWidth: 760, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  overlay: { flex: 1, backgroundColor: '#00000099', justifyContent: 'center', alignItems: 'center', padding: 12 },
  sheet: { width: '100%', maxWidth: 660, maxHeight: '92%', borderRadius: 26, overflow: 'hidden' },
  iconButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
});
