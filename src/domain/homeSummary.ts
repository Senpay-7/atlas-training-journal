import type { Program } from './models';
import { addDays } from './scheduling';

export function weekDates(date: string): string[] {
  const offset = (new Date(date + 'T12:00:00Z').getUTCDay() + 6) % 7;
  const monday = addDays(date, -offset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

// Planning estimate only: 3 seconds per rep, prescribed between-set rest,
// and 90 seconds for each exercise transition. Never used as logged duration.
export function estimateMinutes(entries: Program['days'][number]['exercises']): number {
  const seconds = entries.reduce((sum, e) => sum + e.sets * e.reps * 3 + Math.max(0, e.sets - 1) * e.restSeconds, 0);
  return Math.ceil((seconds + Math.max(0, entries.length - 1) * 90) / 60);
}
