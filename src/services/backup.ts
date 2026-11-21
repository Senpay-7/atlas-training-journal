import { z } from 'zod';
import { activationSchema, preferencesSchema, profileSchema, programSchema, restSchema, sessionSchema, setSchema, xpSchema } from '../domain/models';

export const backupSchema = z.object({
  app: z.literal('atlas'), version: z.union([z.literal(1), z.literal(2), z.literal(3)]), exportedAt: z.string().datetime(),
  preferences: preferencesSchema, profile: profileSchema,
  programs: z.array(programSchema).max(2000), activations: z.array(activationSchema).max(10000),
  rests: z.array(restSchema).max(50000), sessions: z.array(sessionSchema).max(50000),
  sets: z.array(setSchema).max(500000), xp: z.array(xpSchema).max(50000),
}).superRefine((b, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
  function unique(values: string[], label: string) { if (new Set(values).size !== values.length) fail(`Duplicate ${label}`); }
  unique(b.programs.map(x => x.id), 'program');
  unique(b.activations.map(x => x.id), 'activation');
  unique(b.activations.map(x => x.date), 'activation date');
  unique(b.sessions.map(x => x.id), 'session');
  unique(b.sessions.map(x => `${x.activationId}/${x.date}`), 'session date');
  unique(b.rests.map(x => `${x.activationId}/${x.date}`), 'rest');
  unique(b.sets.map(x => `${x.sessionId}/${x.exerciseId}/${x.ordinal}`), 'set');
  unique(b.xp.map(x => x.id), 'reward');
  unique(b.xp.map(x => x.sessionId), 'reward session');
  if (b.sessions.filter(s => !s.completedAt).length > 1) fail('Multiple running sessions');
  if (b.programs.some(p => p.owner !== 'user')) fail('Only personal programs belong in user backups');
  for (const s of b.sessions) {
    const a = b.activations.find(a => a.id === s.activationId);
    if (!a || s.date < a.date) fail('Missing activation or invalid session date');
    unique(s.exercises.map(x => x.exercise.id), 'session exercise');
    if (s.exercises.some(x => x.exercise.id !== x.target.exerciseId)) fail('Mismatched exercise snapshot');
    if (s.completedAt && s.completedAt < s.startedAt) fail('Completion before start');
  }
  for (const r of b.rests) if (!b.activations.some(a => a.id === r.activationId && a.date <= r.date)) fail('Missing rest activation');
  for (const set of b.sets) {
    const entry = b.sessions.find(s => s.id === set.sessionId)?.exercises.find(e => e.exercise.id === set.exerciseId);
    if (!entry || set.ordinal > entry.target.sets) fail('Set does not belong to its workout');
  }
  const rewardedDates: string[] = [];
  for (const reward of b.xp) {
    const s = b.sessions.find(s => s.id === reward.sessionId);
    if (!s?.completedAt || reward.id !== `workout:${reward.sessionId}`) fail('Reward without completed workout');
    if (reward.amount > 0 && s) rewardedDates.push(s.date);
  }
  unique(rewardedDates, 'rewarded training date');
  for (const s of b.sessions.filter(s => s.completedAt)) {
    if (!b.xp.some(e => e.sessionId === s.id)) fail('Completed session missing reward event');
    if (s.exercises.some(e => b.sets.filter(set => set.sessionId === s.id && set.exerciseId === e.exercise.id).length !== e.target.sets)) fail('Completed session missing sets');
  }
});
export type Backup = z.infer<typeof backupSchema>;
export function parseBackup(text: string) {
  if (text.length > 20_000_000) throw new Error('Backup exceeds the 20 MB limit');
  return backupSchema.parse(JSON.parse(text));
}
export function previewBackup(text: string) {
  const data = parseBackup(text);
  return { data, sessions: data.sessions.length, sets: data.sets.length, programs: data.programs.length };
}
