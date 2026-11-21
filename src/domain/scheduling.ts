import { dayKeySchema, type Activation, type RestException } from './models';

export function todayKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function addDays(date: string, days: number) {
  dayKeySchema.parse(date);
  const value = new Date(date + 'T12:00:00Z');
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function resolveSchedule(activations: Activation[], rests: RestException[], date: string) {
  dayKeySchema.parse(date);
  const activation = activations.filter(a => a.date <= date).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))[0];
  if (!activation) return null;
  const relevant = rests.filter(r => r.activationId === activation.id && r.date >= activation.date);
  const exception = relevant.find(r => r.date === date);
  const elapsed = Math.round((Date.parse(date + 'T12:00:00Z') - Date.parse(activation.date + 'T12:00:00Z')) / 86400000);
  const shifts = relevant.filter(r => r.mode === 'shift' && r.date < date).length;
  const length = activation.program.cycle.length;
  const index = ((activation.startIndex + elapsed - shifts) % length + length) % length;
  const dayId = activation.program.cycle[index];
  const day = exception || dayId === null ? null : activation.program.days.find(d => d.id === dayId) ?? null;
  return { activation, day, index, exception: exception ?? null };
}
