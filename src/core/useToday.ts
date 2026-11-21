import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { todayKey } from '../domain/scheduling';
export function useToday() {
  const [today, setToday] = useState(todayKey());
  useEffect(() => {
    const update = () => setToday(todayKey());
    const timer = setInterval(update, 30000);
    const subscription = AppState.addEventListener('change', update);
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  return today;
}
