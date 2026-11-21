import { exercises, programs } from '../content/starter';
import { activationSchema, prescriptionSchema, preferencesSchema, profileSchema, programSchema, setSchema, type LoggedSet, type Preferences, type Profile, type Program, type Session, type Snapshot, type XPEvent } from '../domain/models';
import { addDays, resolveSchedule, todayKey } from '../domain/scheduling';
import { workoutReward } from '../domain/progression';
import { parseBackup, type Backup } from '../services/backup';
import { migrate, type Database } from './database';

let sequence = 0;
const id = () => `${Date.now()}-${String(++sequence).padStart(6, '0')}-${Math.random().toString(36).slice(2, 8)}`;
export class AtlasRepository {
  constructor(private db: Database) {}
  initialize() {
    migrate(this.db);
    this.db.withTransactionSync(() => {
      this.db.runSync('INSERT OR IGNORE INTO settings VALUES (1, ?)', JSON.stringify({ language: 'uk', theme: 'dark', navigation: 'balanced', reducedMotion: false }));
      this.db.runSync('INSERT OR IGNORE INTO profile VALUES (1, ?)', JSON.stringify({ name: 'Athlete', bio: '', joined: todayKey(), banner: -1 }));
      for (const exercise of exercises) this.db.runSync('INSERT INTO exercises VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data', exercise.id, JSON.stringify(exercise));
      for (const program of programs) this.db.runSync("INSERT INTO programs VALUES (?, 'catalog', ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data WHERE programs.owner='catalog'", program.id, JSON.stringify(program));
    });
  }
  snapshot(): Snapshot {
    const all = <T>(table: string) => this.db.getAllSync<{ data: string }>(`SELECT data FROM ${table}`).map(r => JSON.parse(r.data) as T);
    return {
      preferences: preferencesSchema.parse(all('settings')[0]), profile: profileSchema.parse(all('profile')[0]),
      programs: all('programs'), exercises: all('exercises'), activations: all('activations'), rests: all('rest_exceptions'),
      sessions: all('sessions'), sets: all('sets'), xp: all('xp_events'),
    };
  }
  preferences(value: Preferences) { this.db.runSync('UPDATE settings SET data=? WHERE id=1', JSON.stringify(preferencesSchema.parse(value))); }
  profile(value: Profile) { this.db.runSync('UPDATE profile SET data=? WHERE id=1', JSON.stringify(profileSchema.parse(value))); }
  saveProgram(value: Program) {
    const parsed = programSchema.parse(value);
    if (parsed.owner !== 'user' || programs.some(p => p.id === parsed.id)) throw new Error('Customize a personal copy');
    let next: Program;
    this.db.withTransactionSync(() => {
      const state = this.snapshot();
      const known = new Set(state.exercises.map(e => e.id));
      if (parsed.days.some(d => d.exercises.some(e => !known.has(e.exerciseId)))) throw new Error('Unknown exercise');
      const old = state.programs.find(p => p.id === parsed.id);
      if (old?.owner === 'catalog') throw new Error('Customize a personal copy');
      if (old && old.version !== parsed.version) throw new Error('PROGRAM_VERSION_CONFLICT');
      next = { ...parsed, version: old ? old.version + 1 : 1 };
      this.db.runSync("INSERT INTO programs VALUES (?, 'user', ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data", next.id, JSON.stringify(next));
    });
    return next!;
  }
  copyProgram(program: Program) {
    return this.saveProgram({ ...program, id: `user:${id()}`, owner: 'user', parentId: program.id, name: { en: `My ${program.name.en}`, uk: `Моя ${program.name.uk}`, ru: `Моя ${program.name.ru}` } });
  }
  activationDate(date = todayKey()) {
    return this.snapshot().sessions.some(s => s.date >= date) ? addDays(date, 1) : date;
  }
  activate(programId: string, startIndex = 0, date = todayKey()) {
    const state = this.snapshot();
    if (state.sessions.some(s => !s.completedAt)) throw new Error('Finish the active workout first');
    const program = state.programs.find(p => p.id === programId);
    if (!program) throw new Error('Program not found');
    const effectiveDate = this.activationDate(date);
    if (state.activations.some(a => a.date > effectiveDate)) throw new Error('An upcoming program is already scheduled');
    const activation = activationSchema.parse({ id: id(), date: effectiveDate, startIndex, program });
    this.db.withTransactionSync(() => {
      const previous = state.activations.find(a => a.date === effectiveDate);
      if (previous) {
        if (state.sessions.some(s => s.activationId === previous.id)) throw new Error('This activation has training history');
        this.db.runSync('DELETE FROM rest_exceptions WHERE activation_id=?', previous.id);
        this.db.runSync('DELETE FROM activations WHERE id=?', previous.id);
      }
      this.db.runSync('INSERT INTO activations VALUES (?, ?, ?)', activation.id, activation.date, JSON.stringify(activation));
    });
  }
  rest(date: string, mode: 'keep' | 'shift' | null) {
    const state = this.snapshot();
    const scheduled = resolveSchedule(state.activations, state.rests, date);
    if (!scheduled) throw new Error('Choose a program first');
    if (date < todayKey() || state.sessions.some(s => s.date === date)) throw new Error('This date already has workout history');
    if (mode && !scheduled.day && !scheduled.exception) throw new Error('Already a rest day');
    if (mode) {
      const data = { activationId: scheduled.activation.id, date, mode };
      this.db.runSync('INSERT INTO rest_exceptions VALUES (?, ?, ?) ON CONFLICT(activation_id,date) DO UPDATE SET data=excluded.data', data.activationId, date, JSON.stringify(data));
    } else this.db.runSync('DELETE FROM rest_exceptions WHERE activation_id=? AND date=?', scheduled.activation.id, date);
  }
  start(date = todayKey()) {
    const state = this.snapshot();
    const active = state.sessions.find(s => !s.completedAt);
    if (active) return active;
    const scheduled = resolveSchedule(state.activations, state.rests, date);
    if (!scheduled?.day) throw new Error('No workout on this date');
    const existing = state.sessions.find(s => s.date === date && s.activationId === scheduled.activation.id);
    if (existing) throw new Error('Workout already completed');
    const { activation, day } = scheduled;
    const session: Session = {
      id: id(), date, activationId: activation.id, programName: activation.program.name, dayName: day.name, programVersion: activation.program.version,
      exercises: day.exercises.map(target => {
        const exercise = state.exercises.find(e => e.id === target.exerciseId);
        if (!exercise) throw new Error('Missing exercise');
        return { exercise, target };
      }), startedAt: new Date().toISOString(), completedAt: null,
    };
    this.db.runSync('INSERT INTO sessions VALUES (?, ?, ?, NULL, ?)', session.id, activation.id, date, JSON.stringify(session));
    return session;
  }
  saveSet(input: LoggedSet) {
    const value = setSchema.parse(input);
    const session = this.snapshot().sessions.find(s => s.id === value.sessionId);
    const entry = session?.exercises.find(e => e.exercise.id === value.exerciseId);
    if (!session || session.completedAt || !entry || value.ordinal > entry.target.sets) throw new Error('Set cannot be changed');
    this.db.runSync('INSERT INTO sets VALUES (?, ?, ?, ?) ON CONFLICT(session_id,exercise_id,ordinal) DO UPDATE SET data=excluded.data', value.sessionId, value.exerciseId, value.ordinal, JSON.stringify(value));
  }
  editSessionExercise(sessionId: string, exerciseId: string, input: Session['exercises'][number]['target']) {
    const target = prescriptionSchema.parse(input);
    this.db.withTransactionSync(() => {
      const state = this.snapshot();
      const session = state.sessions.find(s => s.id === sessionId);
      const index = session?.exercises.findIndex(e => e.exercise.id === exerciseId) ?? -1;
      if (!session || session.completedAt || index < 0) throw new Error('Completed history is protected');
      const exercise = state.exercises.find(e => e.id === target.exerciseId);
      if (!exercise || session.exercises.some((e, i) => i !== index && e.exercise.id === target.exerciseId)) throw new Error('Choose a different exercise');
      const logged = state.sets.filter(s => s.sessionId === sessionId && s.exerciseId === exerciseId);
      if ((exerciseId !== target.exerciseId && logged.length) || logged.some(s => s.ordinal > target.sets)) throw new Error('Saved sets must be kept. Undo them before replacing this exercise or reducing its sets.');
      const next = { ...session, exercises: session.exercises.map((entry, i) => i === index ? { exercise, target } : entry) };
      this.db.runSync('UPDATE sessions SET data=? WHERE id=?', JSON.stringify(next), sessionId);
    });
  }
  removeSet(sessionId: string, exerciseId: string, ordinal: number) {
    const session = this.snapshot().sessions.find(s => s.id === sessionId);
    if (!session || session.completedAt) throw new Error('Completed history is protected');
    this.db.runSync('DELETE FROM sets WHERE session_id=? AND exercise_id=? AND ordinal=?', sessionId, exerciseId, ordinal);
  }
  complete(sessionId: string): XPEvent {
    let result: XPEvent | undefined;
    this.db.withTransactionSync(() => {
      const state = this.snapshot();
      const session = state.sessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');
      const existing = state.xp.find(e => e.sessionId === sessionId);
      if (session.completedAt && existing) { result = existing; return; }
      const logged = state.sets.filter(s => s.sessionId === sessionId);
      if (session.exercises.some(e => logged.filter(s => s.exerciseId === e.exercise.id).length !== e.target.sets)) throw new Error('Complete every planned set first');
      const completedAt = new Date().toISOString();
      result = workoutReward(session, state.sessions, state.xp);
      this.db.runSync('UPDATE sessions SET completed_at=?, data=? WHERE id=?', completedAt, JSON.stringify({ ...session, completedAt }), sessionId);
      this.db.runSync('INSERT INTO xp_events VALUES (?, ?, ?)', result.id, sessionId, JSON.stringify(result));
    });
    return result!;
  }
  export(): Backup {
    const state = this.snapshot();
    return { app: 'atlas', version: 3, exportedAt: new Date().toISOString(), preferences: state.preferences, profile: state.profile,
      programs: state.programs.filter(p => p.owner === 'user'), activations: state.activations, rests: state.rests, sessions: state.sessions, sets: state.sets, xp: state.xp };
  }
  restore(text: string) {
    const backup = parseBackup(text);
    const known = new Set(this.snapshot().exercises.map(e => e.id));
    for (const p of [...backup.programs, ...backup.activations.map(a => a.program)]) {
      if (p.days.some(d => d.exercises.some(e => !known.has(e.exerciseId)))) throw new Error('Backup requires exercise content not installed on this device');
    }
    const old = JSON.stringify(this.export());
    this.db.withTransactionSync(() => {
      this.db.runSync('INSERT INTO recovery_backups(created_at,data) VALUES (?, ?)', new Date().toISOString(), old);
      this.db.execSync("DELETE FROM xp_events; DELETE FROM sets; DELETE FROM sessions; DELETE FROM rest_exceptions; DELETE FROM activations; DELETE FROM programs WHERE owner='user';");
      this.preferences(backup.preferences); this.profile(backup.profile);
      for (const p of backup.programs) {
        if (programs.some(seed => seed.id === p.id)) throw new Error('Catalog ID collision');
        this.db.runSync('INSERT INTO programs VALUES (?, ?, ?)', p.id, 'user', JSON.stringify(p));
      }
      for (const a of backup.activations) this.db.runSync('INSERT INTO activations VALUES (?, ?, ?)', a.id, a.date, JSON.stringify(a));
      for (const r of backup.rests) this.db.runSync('INSERT INTO rest_exceptions VALUES (?, ?, ?)', r.activationId, r.date, JSON.stringify(r));
      for (const s of backup.sessions) this.db.runSync('INSERT INTO sessions VALUES (?, ?, ?, ?, ?)', s.id, s.activationId, s.date, s.completedAt, JSON.stringify(s));
      for (const s of backup.sets) this.db.runSync('INSERT INTO sets VALUES (?, ?, ?, ?)', s.sessionId, s.exerciseId, s.ordinal, JSON.stringify(s));
      for (const e of backup.xp) this.db.runSync('INSERT INTO xp_events VALUES (?, ?, ?)', e.id, e.sessionId, JSON.stringify(e));
    });
  }
  recoveryBackup() { return this.db.getFirstSync<{ data: string }>('SELECT data FROM recovery_backups ORDER BY id DESC LIMIT 1')?.data; }
}
