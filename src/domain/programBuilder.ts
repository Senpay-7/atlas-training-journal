import { localize, programSchema, type Exercise, type Language, type Localized, type Program } from './models';
import { todayKey } from './scheduling';

type Prescription = Program['days'][number]['exercises'][number];
export type DraftExercise = { exerciseId: string; sets: string; reps: string; restSeconds: string; weight: string; notes: string };
export type DraftDay = { id: string; name: string; exercises: DraftExercise[] };
export type ProgramDraft = { base: Program; name: string; description: string; days: DraftDay[]; cycle: (string | null)[] };
export type BuilderIssue = { path: string; code: 'required' | 'setsRange' | 'repsRange' | 'restRange' | 'weightRange' | 'notesLength' | 'emptyDay' | 'duplicateExercise' | 'unknownExercise' | 'cycleRequired' | 'unscheduledDay' | 'nameLength' };

let sequence = 0;
export const builderId = () => `${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
export const ownText = (text: string): Localized => ({ en: text, uk: text, ru: text });
const updatedText = (original: Localized | undefined, text: string, language: Language) => original && localize(original, language) === text.trim() ? original : ownText(text.trim());
const personalDescription: Localized = { en: 'Personal training program.', uk: 'Власна тренувальна програма.', ru: 'Своя тренировочная программа.' };
export const draftPrescription = (exerciseId: string, source?: Prescription): DraftExercise => ({
  exerciseId, sets: String(source?.sets ?? 2), reps: String(source?.reps ?? 10), restSeconds: String(source?.restSeconds ?? 90),
  weight: source?.weight === undefined ? '' : String(source.weight), notes: source?.notes ?? '',
});

export function newProgramDraft(author: string): ProgramDraft {
  const dayId = `day:${builderId()}`;
  const base: Program = {
    id: `user:${builderId()}`, version: 1, owner: 'user', name: ownText(''),
    description: personalDescription,
    category: 'custom', source: { author, classification: 'inspired-community', rights: 'user-created', checkedOn: todayKey() },
    days: [], cycle: [],
  };
  return { base, name: '', description: '', days: [{ id: dayId, name: 'A', exercises: [] }], cycle: [dayId, null] };
}

export function editProgramDraft(program: Program, language: Language, copy = false): ProgramDraft {
  const base = JSON.parse(JSON.stringify(program)) as Program;
  if (copy) {
    base.id = `user:${builderId()}`; base.version = 1; base.owner = 'user'; base.parentId = program.id;
    base.name = { en: `My ${program.name.en}`, uk: `Моя ${program.name.uk}`, ru: `Моя ${program.name.ru}` };
  }
  return { base, name: localize(base.name, language), description: localize(base.description, language),
    days: base.days.map(day => ({ id: day.id, name: localize(day.name, language), exercises: day.exercises.map(e => draftPrescription(e.exerciseId, e)) })), cycle: [...base.cycle] };
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const next = [...items]; const target = index + direction;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) return next;
  [next[index], next[target]] = [next[target]!, next[index]!];
  return next;
}

// Preserve cycle positions when deleting a day: every occurrence becomes recovery.
export function removeDraftDay(draft: ProgramDraft, dayId: string): ProgramDraft {
  return { ...draft, days: draft.days.filter(d => d.id !== dayId), cycle: draft.cycle.map(id => id === dayId ? null : id) };
}

const integer = (text: string, min: number, max: number) => /^\d+$/.test(text.trim()) && Number(text) >= min && Number(text) <= max;
export function validateProgramDraft(draft: ProgramDraft, known: Exercise[]): BuilderIssue[] {
  const issues: BuilderIssue[] = [];
  const add = (path: string, code: BuilderIssue['code']) => issues.push({ path, code });
  if (!draft.name.trim()) add('name', 'required');
  else if (draft.name.trim().length > 100) add('name', 'nameLength');
  if (!draft.days.length) add('days', 'emptyDay');
  for (const day of draft.days) {
    const path = `days.${day.id}`;
    if (!day.name.trim()) add(`${path}.name`, 'required');
    else if (day.name.trim().length > 100) add(`${path}.name`, 'nameLength');
    if (!day.exercises.length) add(path, 'emptyDay');
    if (!draft.cycle.includes(day.id)) add(path, 'unscheduledDay');
    if (new Set(day.exercises.map(e => e.exerciseId)).size !== day.exercises.length) add(path, 'duplicateExercise');
    for (const e of day.exercises) {
      const p = `${path}.${e.exerciseId}`;
      if (!known.some(x => x.id === e.exerciseId)) add(p, 'unknownExercise');
      if (!integer(e.sets, 1, 20)) add(`${p}.sets`, 'setsRange');
      if (!integer(e.reps, 1, 100)) add(`${p}.reps`, 'repsRange');
      if (!integer(e.restSeconds, 0, 600)) add(`${p}.restSeconds`, 'restRange');
      const weight = e.weight.trim().replace(',', '.');
      if (weight && (!/^\d+(\.\d+)?$/.test(weight) || Number(weight) > 1500)) add(`${p}.weight`, 'weightRange');
      if (e.notes.length > 500) add(`${p}.notes`, 'notesLength');
    }
  }
  if (!draft.cycle.length || draft.cycle.length > 56 || !draft.cycle.some(Boolean) || draft.cycle.some(id => id !== null && !draft.days.some(d => d.id === id))) add('cycle', 'cycleRequired');
  return issues;
}

export function finishProgramDraft(draft: ProgramDraft, language: Language, known: Exercise[]): Program {
  if (validateProgramDraft(draft, known).length) throw new Error('Invalid program draft');
  return programSchema.parse({ ...draft.base,
    name: updatedText(draft.base.name, draft.name, language),
    description: draft.description.trim() ? updatedText(draft.base.description, draft.description, language) : personalDescription,
    days: draft.days.map(day => ({ id: day.id, name: updatedText(draft.base.days.find(d => d.id === day.id)?.name, day.name, language),
      exercises: day.exercises.map(e => ({ exerciseId: e.exerciseId, sets: Number(e.sets), reps: Number(e.reps), restSeconds: Number(e.restSeconds),
        ...(e.weight.trim() ? { weight: Number(e.weight.trim().replace(',', '.')) } : {}), ...(e.notes.trim() ? { notes: e.notes.trim() } : {}) })) })),
    cycle: draft.cycle,
  });
}

const normalize = (value: string) => value.trim().toLowerCase().replaceAll('ё', 'е').normalize('NFKD');
export function exerciseChoices(exercises: Exercise[], query: string, equipment: string, excluded: string[], replacing?: Exercise): Exercise[] {
  return exercises.filter(e => !excluded.includes(e.id) && (equipment === 'all' || e.equipment === equipment) &&
    normalize([...Object.values(e.name), ...e.aliases, ...e.muscles].join(' ')).includes(normalize(query)))
    .sort((a, b) => Number(b.pattern === replacing?.pattern) - Number(a.pattern === replacing?.pattern));
}
