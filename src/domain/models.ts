import { z } from 'zod';

export const localizedSchema = z.object({ en: z.string().trim().min(1), uk: z.string().trim().min(1), ru: z.string().trim().min(1) });
export type Localized = z.infer<typeof localizedSchema>;
export type Language = keyof Localized;
export const localize = (text: Localized, language: Language) => text[language] || text.en;
export const dayKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(value + 'T12:00:00Z');
  return !isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}, 'Invalid calendar date');
export const sourceSchema = z.object({
  classification: z.enum(['verified-original', 'publicly-demonstrated', 'inspired-community']),
  author: z.string(), url: z.string().url().optional(), checkedOn: dayKeySchema,
  rights: z.enum(['atlas-original', 'user-created', 'licensed', 'reference-only', 'unverified']),
});
export const exerciseSchema = z.object({
  id: z.string().min(1), name: localizedSchema, instruction: localizedSchema,
  muscles: z.array(z.string()).min(1), equipment: z.enum(['bodyweight', 'dumbbell', 'barbell', 'machine']),
  pattern: z.string(), aliases: z.array(z.string()), source: sourceSchema,
});
export type Exercise = z.infer<typeof exerciseSchema>;
export const prescriptionSchema = z.object({
  exerciseId: z.string(), sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(100), restSeconds: z.number().int().min(0).max(600),
  weight: z.number().min(0).max(1500).optional(), notes: z.string().max(500).optional(),
});
export const programDaySchema = z.object({
  id: z.string(), name: localizedSchema, exercises: z.array(prescriptionSchema).min(1),
}).refine(day => new Set(day.exercises.map(e => e.exerciseId)).size === day.exercises.length, 'Duplicate exercise in day');
export const programSchema = z.object({
  id: z.string(), version: z.number().int().positive(), name: localizedSchema,
  description: localizedSchema, category: z.enum(['full-body', 'upper-lower', 'ppl', 'home', 'custom']),
  source: sourceSchema, days: z.array(programDaySchema).min(1),
  cycle: z.array(z.string().nullable()).min(1).max(56),
  owner: z.enum(['catalog', 'user']), parentId: z.string().optional(),
}).superRefine((p, ctx) => {
  const ids = new Set(p.days.map(day => day.id));
  if (ids.size !== p.days.length || !p.cycle.some(id => id !== null) || p.cycle.some(id => id !== null && !ids.has(id)))
    ctx.addIssue({ code: 'custom', message: 'Cycle references must resolve to unique training days' });
});
export type Program = z.infer<typeof programSchema>;
export const preferencesSchema = z.object({
  language: z.enum(['uk', 'en', 'ru']), theme: z.enum(['dark', 'light', 'black']),
  navigation: z.enum(['balanced', 'floating', 'minimal', 'dynamic']),
  reducedMotion: z.boolean(),
});
export type Preferences = z.infer<typeof preferencesSchema>;
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(60), bio: z.string().max(240),
  joined: dayKeySchema, banner: z.number().int().min(-1).max(9),
});
export type Profile = z.infer<typeof profileSchema>;
export const activationSchema = z.object({
  id: z.string(), date: dayKeySchema, startIndex: z.number().int().nonnegative(), program: programSchema,
}).refine(a => a.startIndex < a.program.cycle.length, 'Invalid starting day');
export type Activation = z.infer<typeof activationSchema>;
export const restSchema = z.object({ activationId: z.string(), date: dayKeySchema, mode: z.enum(['keep', 'shift']) });
export type RestException = z.infer<typeof restSchema>;
export const sessionSchema = z.object({
  id: z.string(), date: dayKeySchema, activationId: z.string(),
  programName: localizedSchema, dayName: localizedSchema, programVersion: z.number().int().positive(),
  exercises: z.array(z.object({ exercise: exerciseSchema, target: prescriptionSchema })).min(1),
  startedAt: z.string().datetime(), completedAt: z.string().datetime().nullable(),
});
export type Session = z.infer<typeof sessionSchema>;
export const setSchema = z.object({
  sessionId: z.string(), exerciseId: z.string(), ordinal: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(1000), weight: z.number().min(0).max(1500),
});
export type LoggedSet = z.infer<typeof setSchema>;
export const xpSchema = z.object({ id: z.string(), sessionId: z.string(), amount: z.number().int().min(0).max(100), ruleVersion: z.literal(1) });
export type XPEvent = z.infer<typeof xpSchema>;
export type Snapshot = { preferences: Preferences; profile: Profile; programs: Program[]; exercises: Exercise[]; activations: Activation[]; rests: RestException[]; sessions: Session[]; sets: LoggedSet[]; xp: XPEvent[] };
