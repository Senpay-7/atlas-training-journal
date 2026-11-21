import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { AtlasRepository } from '../src/data/repository';
import type { Database } from '../src/data/database';
import { exercises, programs } from '../src/content/starter';
import { addDays, resolveSchedule, todayKey } from '../src/domain/scheduling';
import { levelFromXP } from '../src/domain/progression';
import { parseBackup } from '../src/services/backup';
import { programSchema, type Activation, type RestException } from '../src/domain/models';
import { draftPrescription, editProgramDraft, exerciseChoices, finishProgramDraft, moveItem, newProgramDraft, removeDraftDay, validateProgramDraft } from '../src/domain/programBuilder';
import { estimateMinutes, weekDates } from '../src/domain/homeSummary';
function setup() {
  const sql = new DatabaseSync(':memory:');
  const db: Database = {
    execSync: query => sql.exec(query),
    runSync: (query, ...args) => sql.prepare(query).run(...args),
    getAllSync: (query, ...args) => sql.prepare(query).all(...args) as never,
    getFirstSync: (query, ...args) => (sql.prepare(query).get(...args) ?? null) as never,
    withTransactionSync: task => { sql.exec('BEGIN'); try { task(); sql.exec('COMMIT'); } catch (error) { sql.exec('ROLLBACK'); throw error; } },
  };
  const repo = new AtlasRepository(db); repo.initialize();
  return { repo, db, sql };
}
function logAll(repo: AtlasRepository) {
  const session = repo.start();
  for (const { exercise, target } of session.exercises) for (let ordinal = 1; ordinal <= target.sets; ordinal++) repo.saveSet({ sessionId: session.id, exerciseId: exercise.id, ordinal, reps: target.reps, weight: 10 });
  return session;
}
describe('catalog and real SQLite persistence', () => {
  it('seeds once, preserves preferences and personal copies across initialization', () => {
    const { repo } = setup();
    repo.preferences({ language: 'ru', theme: 'light', navigation: 'floating', reducedMotion: true });
    repo.copyProgram(programs[0]!); repo.initialize();
    expect(repo.snapshot().programs).toHaveLength(programs.length + 1);
    expect(repo.snapshot().preferences.language).toBe('ru');
    expect(repo.snapshot().exercises).toHaveLength(17);
  });
  it('all exercise references resolve and sources are original', () => {
    for (const p of programs) for (const d of p.days) for (const e of d.exercises) expect(exercises.some(x => x.id === e.exerciseId)).toBe(true);
    expect(programs.every(p => p.source.rights === 'atlas-original')).toBe(true);
  });
  it('restores an interrupted session and each committed set after reopening the repository', () => {
    const { repo, db } = setup(); repo.activate(programs[0]!.id);
    const s = repo.start();
    repo.saveSet({ sessionId: s.id, exerciseId: s.exercises[0]!.exercise.id, ordinal: 1, reps: 8, weight: 12.5 });
    const reloaded = new AtlasRepository(db); reloaded.initialize();
    expect(reloaded.start().id).toBe(s.id);
    expect(reloaded.snapshot().sets[0]?.weight).toBe(12.5);
  });
  it('rejects incomplete completion, invalid reps and unrelated sets', () => {
    const { repo } = setup(); repo.activate(programs[0]!.id); const s = repo.start();
    expect(() => repo.complete(s.id)).toThrow();
    expect(() => repo.saveSet({ sessionId: s.id, exerciseId: 'goblet-squat', ordinal: 1, reps: 0, weight: 10 })).toThrow();
    expect(() => repo.saveSet({ sessionId: s.id, exerciseId: 'unknown', ordinal: 1, reps: 10, weight: 10 })).toThrow();
    expect(repo.snapshot().xp).toHaveLength(0);
  });
  it('awards XP once, protects history and stores completion and reward atomically', () => {
    const { repo } = setup(); repo.activate(programs[0]!.id); const s = logAll(repo);
    expect(repo.complete(s.id).amount).toBe(100); repo.complete(s.id);
    expect(repo.snapshot().xp).toHaveLength(1);
    expect(() => repo.removeSet(s.id, s.exercises[0]!.exercise.id, 1)).toThrow();
    const history = JSON.stringify(repo.snapshot().sessions);
    repo.activate(programs[1]!.id);
    expect(JSON.stringify(repo.snapshot().sessions)).toBe(history);
    expect(repo.snapshot().activations.some(a => a.date === addDays(todayKey(), 1))).toBe(true);
  });
  it('rolls back completion when the reward insert fails', () => {
    const { repo, sql } = setup(); repo.activate(programs[0]!.id); const s = logAll(repo);
    sql.exec("CREATE TRIGGER fail_reward BEFORE INSERT ON xp_events BEGIN SELECT RAISE(ABORT, 'Simulated disk failure'); END;");
    expect(() => repo.complete(s.id)).toThrow('Simulated disk failure');
    expect(repo.snapshot().sessions[0]?.completedAt).toBeNull();
    expect(repo.snapshot().xp).toHaveLength(0);
  });
  it('customization cannot change the catalog, active snapshot or past workout', () => {
    const { repo } = setup(); const copy = repo.copyProgram(programs[0]!); repo.activate(copy.id); const s = logAll(repo); repo.complete(s.id);
    repo.saveProgram({ ...copy, name: { en: 'Changed', uk: 'Changed', ru: 'Changed' } });
    expect(repo.snapshot().programs.find(p => p.id === copy.id)?.version).toBe(2);
    expect(repo.snapshot().sessions[0]?.programName.en).toBe(copy.name.en);
    expect(repo.snapshot().activations[0]?.program.name.en).toBe(copy.name.en);
    expect(repo.snapshot().programs.find(p => p.id === programs[0]!.id)?.name.en).toBe(programs[0]!.name.en);
  });
});
describe('backups', () => {
  it('persists all three themes and rejects unsupported themes', () => {
    const { repo, db } = setup();
    for (const theme of ['dark', 'light', 'black'] as const) {
      repo.preferences({ ...repo.snapshot().preferences, theme });
      const reloaded = new AtlasRepository(db); reloaded.initialize();
      expect(reloaded.snapshot().preferences.theme).toBe(theme);
      setup().repo.restore(JSON.stringify(reloaded.export()));
    }
    expect(() => repo.preferences({ ...repo.snapshot().preferences, theme: 'green' as never })).toThrow();
  });
  it('imports legacy backups and exports version 3 for the expanded theme settings', () => {
    const { repo } = setup(); repo.activate(programs[0]!.id);
    const oldBackup = { ...repo.export(), version: 1 };
    const fresh = setup().repo; fresh.restore(JSON.stringify(oldBackup));
    expect(fresh.snapshot().activations).toEqual(repo.snapshot().activations);
    expect(fresh.export().version).toBe(3);
    fresh.restore(JSON.stringify({ ...oldBackup, version: 2 }));
    expect(() => fresh.restore(JSON.stringify({ ...oldBackup, version: 4 }))).toThrow();
  });
  it('round trips, repeated restores do not duplicate rewards, and creates a recovery backup', () => {
    const { repo } = setup(); repo.activate(programs[0]!.id); repo.complete(logAll(repo).id);
    const backup = repo.export(); const text = JSON.stringify(backup);
    repo.restore(text); repo.restore(text);
    expect(repo.snapshot().sessions).toEqual(backup.sessions);
    expect(repo.snapshot().sets).toEqual(backup.sets);
    expect(repo.snapshot().xp).toHaveLength(1);
    expect(parseBackup(repo.recoveryBackup()!).sessions).toEqual(backup.sessions);
  });
  it('rejects foreign/invalid/orphaned backups without changing local data', () => {
    const { repo } = setup(); const baseline = repo.snapshot();
    expect(() => repo.restore('{"app":"daycounter"}')).toThrow();
    expect(() => repo.restore(JSON.stringify({ ...repo.export(), xp: [{ id: 'workout:missing', sessionId: 'missing', amount: 100, ruleVersion: 1 }] }))).toThrow();
    expect(repo.snapshot()).toEqual(baseline);
  });
  it('rolls back an import failure inside the transaction', () => {
    const { repo } = setup(); repo.activate(programs[0]!.id); const baseline = repo.snapshot();
    const backup = repo.export(); backup.programs = [{ ...programs[0]!, owner: 'user' }];
    expect(() => repo.restore(JSON.stringify(backup))).toThrow('Catalog ID collision');
    expect(repo.snapshot()).toEqual(baseline);
  });
  it('rejects duplicate sets and invalid calendar dates', () => {
    const { repo } = setup(); repo.activate(programs[0]!.id); logAll(repo); const backup = repo.export();
    backup.sets.push(backup.sets[0]!);
    expect(() => parseBackup(JSON.stringify(backup))).toThrow('Duplicate set');
    expect(() => addDays('2026-02-30', 1)).toThrow();
  });
  it('rejects backups with unknown exercise content before changing user data', () => {
    const { repo } = setup(); const original = repo.snapshot();
    const backup = repo.export(); const copy = structuredClone(programs[0]!);
    copy.id = 'user:foreign'; copy.owner = 'user'; copy.days[0]!.exercises[0]!.exerciseId = 'foreign:missing';
    backup.programs.push(copy);
    expect(() => repo.restore(JSON.stringify(backup))).toThrow('not installed');
    expect(repo.snapshot()).toEqual(original);
  });
});

describe('visual program builder and version safety', () => {
  it('ships 14 valid, localized templates with unique IDs and fully scheduled days', () => {
    expect(programs).toHaveLength(14);
    expect(new Set(programs.map(p => p.id)).size).toBe(programs.length);
    for (const p of programs) {
      expect(programSchema.safeParse(p).success).toBe(true);
      expect(p.days.every(day => p.cycle.includes(day.id))).toBe(true);
      expect(p.source.rights).toBe('atlas-original');
    }
  });
  it('changes today’s targets without changing the split snapshot and survives restart', () => {
    const { repo, db } = setup(); repo.activate(programs[0]!.id); const session = repo.start();
    const activation = structuredClone(repo.snapshot().activations);
    const entry = session.exercises[0]!;
    repo.editSessionExercise(session.id, entry.exercise.id, { ...entry.target, sets: 4, reps: 15, weight: 12.5 });
    expect(new AtlasRepository(db).snapshot().sessions[0]?.exercises[0]?.target.reps).toBe(15);
    expect(repo.snapshot().activations).toEqual(activation);
    const fresh = setup().repo; fresh.restore(JSON.stringify(repo.export()));
    expect(fresh.snapshot().sessions).toEqual(repo.snapshot().sessions);
  });
  it('protects logged sets, duplicate exercise slots and completed history during quick edits', () => {
    const { repo } = setup(); repo.activate(programs[0]!.id); const session = repo.start();
    const first = session.exercises[0]!;
    repo.saveSet({ sessionId: session.id, exerciseId: first.exercise.id, ordinal: 2, reps: 9, weight: 10 });
    expect(() => repo.editSessionExercise(session.id, first.exercise.id, { ...first.target, exerciseId: 'split-squat' })).toThrow('Saved sets');
    expect(() => repo.editSessionExercise(session.id, first.exercise.id, { ...first.target, sets: 1 })).toThrow('Saved sets');
    expect(() => repo.editSessionExercise(session.id, first.exercise.id, { ...first.target, exerciseId: session.exercises[1]!.exercise.id })).toThrow('different exercise');
    repo.removeSet(session.id, first.exercise.id, 2);
    repo.editSessionExercise(session.id, first.exercise.id, { ...first.target, exerciseId: 'split-squat' });
    expect(repo.snapshot().sessions[0]?.exercises[0]?.exercise.id).toBe('split-squat');
    repo.complete(logAll(repo).id);
    expect(() => repo.editSessionExercise(session.id, 'split-squat', { ...first.target, exerciseId: 'split-squat' })).toThrow('protected');
  });
  function custom() {
    const draft = newProgramDraft('Test athlete');
    draft.name = 'My two-day cycle';
    draft.days[0]!.exercises = [{ ...draftPrescription('bench'), sets: '3', reps: '8', restSeconds: '120', weight: '42,5', notes: 'Controlled repetitions' }];
    return draft;
  }
  it('creates a new program, preserves targets after reopening and restores them from backup', () => {
    const { repo, db } = setup();
    const saved = repo.saveProgram(finishProgramDraft(custom(), 'en', exercises));
    expect(saved.category).toBe('custom');
    expect(saved.source.rights).toBe('user-created');
    expect(saved.name.uk).toBe('My two-day cycle');
    const reloaded = new AtlasRepository(db); reloaded.initialize();
    expect(reloaded.snapshot().programs.find(p => p.id === saved.id)).toEqual(saved);
    reloaded.activate(saved.id); const session = reloaded.start();
    expect(session.exercises[0]?.target).toEqual({ exerciseId: 'bench', sets: 3, reps: 8, restSeconds: 120, weight: 42.5, notes: 'Controlled repetitions' });
    const exported = JSON.stringify(reloaded.export());
    const other = setup().repo; other.restore(exported);
    expect(other.snapshot().sessions).toEqual(reloaded.snapshot().sessions);
    expect(other.snapshot().programs.find(p => p.id === saved.id)).toEqual(saved);
  });
  it('editing a copy does not create an orphan on cancel or mutate the source', () => {
    const { repo } = setup(); const source = repo.snapshot().programs[0]!;
    const before = JSON.stringify(source);
    const draft = editProgramDraft(source, 'uk', true);
    draft.name = 'My copy'; draft.days[0]!.exercises.splice(0, 1);
    expect(JSON.stringify(source)).toBe(before);
    expect(repo.snapshot().programs.filter(p => p.owner === 'user')).toHaveLength(0);
    const saved = repo.saveProgram(finishProgramDraft(draft, 'uk', exercises));
    expect(saved.id).not.toBe(source.id); expect(saved.parentId).toBe(source.id); expect(saved.version).toBe(1);
    expect(repo.snapshot().programs.find(p => p.id === source.id)).toEqual(source);
  });
  it('saving targets and replacing exercises leaves active and completed snapshots untouched', () => {
    const { repo } = setup(); const v1 = repo.saveProgram(finishProgramDraft(custom(), 'en', exercises));
    repo.activate(v1.id); const s = repo.start();
    const draft = editProgramDraft(v1, 'en');
    draft.days[0]!.exercises[0]!.exerciseId = 'db-press';
    draft.days[0]!.exercises[0]!.weight = '15';
    const v2 = repo.saveProgram(finishProgramDraft(draft, 'en', exercises));
    expect(v2.version).toBe(2);
    expect(repo.snapshot().activations[0]?.program.version).toBe(1);
    expect(repo.start().exercises).toEqual(s.exercises);
    for (let ordinal = 1; ordinal <= 3; ordinal++) repo.saveSet({ sessionId: s.id, exerciseId: 'bench', ordinal, reps: 8, weight: 42.5 });
    repo.complete(s.id); const oldHistory = repo.snapshot().sessions[0];
    repo.activate(v2.id);
    const next = repo.start(addDays(todayKey(), 1));
    expect(next.programVersion).toBe(2); expect(next.exercises[0]?.exercise.id).toBe('db-press');
    expect(next.exercises[0]?.target.weight).toBe(15);
    expect(repo.snapshot().sessions.find(x => x.id === s.id)).toEqual(oldHistory);
  });
  it('rejects a stale edit instead of silently overwriting a newer version', () => {
    const { repo } = setup(); const original = repo.saveProgram(finishProgramDraft(custom(), 'en', exercises));
    const saved = repo.saveProgram({ ...original, name: { en: 'New', uk: 'New', ru: 'New' } });
    expect(() => repo.saveProgram(original)).toThrow('PROGRAM_VERSION_CONFLICT');
    expect(repo.snapshot().programs.find(p => p.id === saved.id)).toEqual(saved);
  });
  it('keeps invalid numeric text out of persistence and accepts zero rest/weight', () => {
    const draft = custom();
    const entry = draft.days[0]!.exercises[0]!;
    entry.sets = '1.5'; entry.reps = '1e2'; entry.restSeconds = ''; entry.weight = '-1';
    expect(validateProgramDraft(draft, exercises).map(i => i.code)).toEqual(['setsRange', 'repsRange', 'restRange', 'weightRange']);
    expect(() => finishProgramDraft(draft, 'en', exercises)).toThrow('Invalid program draft');
    entry.sets = '1'; entry.reps = '8'; entry.restSeconds = '0'; entry.weight = '0';
    expect(validateProgramDraft(draft, exercises)).toEqual([]);
    expect(finishProgramDraft(draft, 'en', exercises).days[0]?.exercises[0]?.weight).toBe(0);
  });
  it('replaces all removed-day occurrences with rest without shifting other positions', () => {
    const draft = custom(); const a = draft.days[0]!.id;
    draft.days.push({ id: 'b', name: 'B', exercises: [draftPrescription('row')] });
    draft.cycle = [a, 'b', null, a, 'b'];
    const edited = removeDraftDay(draft, a);
    expect(edited.cycle).toEqual([null, 'b', null, null, 'b']);
    expect(validateProgramDraft(edited, exercises)).toEqual([]);
    const p = finishProgramDraft(edited, 'en', exercises);
    const activation = { id: 'custom', date: '2026-10-10', startIndex: 0, program: p };
    expect(resolveSchedule([activation], [], '2026-10-10')?.day).toBeNull();
    expect(resolveSchedule([activation], [], '2026-10-11')?.day?.id).toBe('b');
    expect(draft.days).toHaveLength(2);
  });
  it('rejects empty, unassigned and duplicate-exercise workouts before saving', () => {
    const draft = custom(); draft.name = ' ';
    draft.days.push({ id: 'b', name: '', exercises: [] });
    draft.days[0]!.exercises.push(draftPrescription('bench'));
    const codes = validateProgramDraft(draft, exercises).map(i => i.code);
    expect(codes).toEqual(expect.arrayContaining(['required', 'emptyDay', 'unscheduledDay', 'duplicateExercise']));
    draft.cycle = [null];
    expect(validateProgramDraft(draft, exercises).some(i => i.code === 'cycleRequired')).toBe(true);
  });
  it('reorders prescriptions without losing weight, notes or exercise identity', () => {
    const draft = custom(); const a = draft.days[0]!;
    a.exercises.push(draftPrescription('row'));
    a.exercises = moveItem(a.exercises, 0, 1);
    const saved = finishProgramDraft(draft, 'en', exercises);
    expect(saved.days[0]?.exercises.map(e => e.exerciseId)).toEqual(['row', 'bench']);
    expect(saved.days[0]?.exercises[1]?.weight).toBe(42.5);
    expect(saved.days[0]?.exercises[1]?.notes).toBe('Controlled repetitions');
    expect(moveItem(a.exercises, 0, -1)).toEqual(a.exercises);
  });
  it('filters equipment and used exercises, ranking the same movement pattern first', () => {
    const bench = exercises.find(e => e.id === 'bench')!;
    const choices = exerciseChoices(exercises, '', 'dumbbell', ['bench', 'row'], bench);
    expect(choices[0]?.id).toBe('db-press');
    expect(choices.every(e => e.equipment === 'dumbbell' && e.id !== 'row')).toBe(true);
    expect(exerciseChoices(exercises, 'жим лежа', 'all', [], bench).some(e => e.id === 'bench')).toBe(true);
  });
});
describe('deterministic calendar and progression', () => {
  it('shows the Monday-based current week across year and DST boundaries', () => {
    expect(weekDates('2027-01-01')).toEqual(['2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03']);
    expect(weekDates('2026-10-25')[0]).toBe('2026-10-19');
  });
  it('estimates prescribed work without claiming a logged duration or adding rest after the last set', () => {
    expect(estimateMinutes([])).toBe(0);
    expect(estimateMinutes([{ exerciseId: 'bench', sets: 1, reps: 10, restSeconds: 600 }])).toBe(1);
    expect(estimateMinutes([{ exerciseId: 'bench', sets: 3, reps: 10, restSeconds: 60 }])).toBe(4);
  });
  const a: Activation = { id: 'a', date: '2026-10-10', program: programs[3]!, startIndex: 0 };
  const title = (date: string, rests: RestException[] = []) => resolveSchedule([a], rests, date)?.day?.id ?? null;
  it('uses local calendar keys and UTC date arithmetic across DST and leap days', () => {
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26'); expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(Array.from({ length: 8 }, (_, i) => title(addDays(a.date, i)))).toEqual(['push', 'pull', 'legs', null, 'push', 'pull', 'legs', null]);
  });
  it('keep skips one workout; shift preserves it; consecutive shifts and removal are deterministic', () => {
    const shift: RestException[] = [{ activationId: 'a', date: a.date, mode: 'shift' }];
    expect(title(a.date, shift)).toBeNull(); expect(title(addDays(a.date, 1), shift)).toBe('push');
    expect(title(addDays(a.date, 1), [{ ...shift[0]!, mode: 'keep' }])).toBe('pull');
    shift.push({ activationId: 'a', date: addDays(a.date, 1), mode: 'shift' });
    expect(title(addDays(a.date, 2), shift)).toBe('push'); expect(title(addDays(a.date, 2))).toBe('legs');
  });
  it('old rest exceptions do not affect a new activation', () => {
    const b = { ...a, id: 'b', date: '2026-10-12', startIndex: 2 };
    expect(resolveSchedule([a, b], [{ activationId: 'a', date: '2026-10-11', mode: 'shift' }], b.date)?.day?.id).toBe('legs');
  });
  it('handles exact and multiple level-ups without negative XP', () => {
    expect(levelFromXP(0).level).toBe(1); expect(levelFromXP(100).level).toBe(2);
    expect(levelFromXP(10000).level).toBeGreaterThan(5); expect(() => levelFromXP(-1)).toThrow();
  });
});
