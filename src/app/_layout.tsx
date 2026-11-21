import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, View, Text, Pressable } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { bootstrap, useAtlas } from '../core/store';
import { Button, Label, Sheet } from '../design-system/ui';
import { useDesign } from '../design-system/theme';
import { initializeAccount } from '../services/auth';
export default function Root() {
  const { data, error, dismiss } = useAtlas();
  const { colors, t } = useDesign();
  useEffect(() => { void bootstrap(); void initializeAccount().catch(error => useAtlas.setState({ error: String(error) })); }, []);
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><StatusBar style={data?.preferences.theme === 'light' ? 'dark' : 'light'} />
    {!data ? <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 20 }}><Text style={{ fontSize: 30, color: colors.text, letterSpacing: 9 }}>ATLAS</Text>{error ? <><Text style={{ color: colors.danger }}>{error}</Text><Pressable onPress={() => void bootstrap()}><Text style={{ color: colors.accent }}>Retry</Text></Pressable></> : <ActivityIndicator color={colors.accent} />}</View> : <><Stack screenOptions={{ headerShown: false }} /><Sheet title={t('error')} visible={!!error} close={dismiss}><Label>{error}</Label><Button title={t('close')} onPress={dismiss} /></Sheet></>}
  </SafeAreaProvider></GestureHandlerRootView>;
}
