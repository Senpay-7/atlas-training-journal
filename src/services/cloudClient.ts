import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient, processLock } from '@supabase/supabase-js';
import { authStorage } from './authStorage';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const cloudConfigured = !!url && !!key;
export const cloudClient = cloudConfigured ? createClient(url!, key!, {
  auth: { storage: authStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce', ...(Platform.OS !== 'web' ? { lock: processLock } : {}) },
}) : null;
