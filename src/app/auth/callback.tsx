import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { exchangeCallback } from '../../services/auth';
import { Button, Label, Screen } from '../../design-system/ui';
import { useDesign } from '../../design-system/theme';
export default function AuthCallback() {
  const { code, error_description } = useLocalSearchParams<{ code?: string; error_description?: string }>();
  const { t } = useDesign();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const url = Platform.OS === 'web' ? window.location.href : 'atlas://auth/callback?' + new URLSearchParams({ ...(code ? { code } : {}), ...(error_description ? { error_description } : {}) }).toString();
    if (Platform.OS === 'web') window.history.replaceState({}, '', '/auth/callback');
    void exchangeCallback(url).then(() => router.replace('/profile')).catch(e => setError(String(e)));
  }, [code, error_description]);
  return <Screen title="ATLAS"><Label>{error ?? '…'}</Label><Button title={t('profile')} onPress={() => router.replace('/profile')} /></Screen>;
}
