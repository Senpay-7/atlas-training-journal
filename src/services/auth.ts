import { create } from 'zustand';
import { AppState, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import type { User } from '@supabase/supabase-js';
import { cloudClient } from './cloudClient';
export const useAccount = create<{ user: User | null; ready: boolean; error: string | null }>(() => ({ user: null, ready: false, error: null }));
let initialized = false;
export async function initializeAccount() {
  if (initialized) return;
  initialized = true;
  if (!cloudClient) { useAccount.setState({ ready: true }); return; }
  const client = cloudClient;
  cloudClient.auth.onAuthStateChange((_event, session) => useAccount.setState({ user: session?.user ?? null, ready: true }));
  const { data, error } = await cloudClient.auth.getSession();
  useAccount.setState({ user: data.session?.user ?? null, ready: true, error: error?.message ?? null });
  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', state => {
      if (state === 'active') client.auth.startAutoRefresh(); else client.auth.stopAutoRefresh();
    });
  }
}
export function requireCloud() { if (!cloudClient) throw new Error('Cloud is not configured'); return cloudClient; }
export async function requestEmailCode(email: string) {
  const { error } = await requireCloud().auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
  if (error) throw error;
}
export async function verifyEmailCode(email: string, token: string) {
  const { error } = await requireCloud().auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'email' });
  if (error) throw error;
}
export async function signInGoogle() {
  const redirectTo = Platform.OS === 'web' ? window.location.origin + '/auth/callback' : 'atlas://auth/callback';
  const { data, error } = await requireCloud().auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: Platform.OS !== 'web' } });
  if (error) throw error;
  if (Platform.OS !== 'web' && data.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success') await exchangeCallback(result.url);
  }
}
const exchanges = new Map<string, Promise<void>>();
export function exchangeCallback(url: string) {
  const parsed = new URL(url);
  const error = parsed.searchParams.get('error_description');
  if (error) return Promise.reject(new Error(error));
  const code = parsed.searchParams.get('code');
  if (!code) return Promise.resolve();
  const current = exchanges.get(code);
  if (current) return current;
  const promise = (async () => { const { error } = await requireCloud().auth.exchangeCodeForSession(code); if (error) throw error; })();
  exchanges.set(code, promise);
  return promise;
}
export async function signOut() { const { error } = await requireCloud().auth.signOut(); if (error) throw error; }
