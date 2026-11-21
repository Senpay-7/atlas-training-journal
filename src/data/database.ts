// The domain repository also runs against real Node SQLite in tests.
export interface Database {
  execSync(sql: string): void;
  runSync(sql: string, ...params: (string | number | null)[]): unknown;
  getAllSync<T>(sql: string, ...params: (string | number | null)[]): T[];
  getFirstSync<T>(sql: string, ...params: (string | number | null)[]): T | null;
  withTransactionSync(task: () => void): void;
}
export function migrate(db: Database) {
  db.execSync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  const version = db.getFirstSync<{ user_version: number }>('PRAGMA user_version')?.user_version ?? 0;
  if (version > 1) throw new Error('This database needs a newer ATLAS version.');
  if (version === 1) return;
  db.withTransactionSync(() => db.execSync(`
    CREATE TABLE settings (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL);
    CREATE TABLE profile (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL);
    CREATE TABLE exercises (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE programs (id TEXT PRIMARY KEY, owner TEXT NOT NULL, data TEXT NOT NULL);
    CREATE TABLE activations (id TEXT PRIMARY KEY, date TEXT NOT NULL UNIQUE, data TEXT NOT NULL);
    CREATE TABLE rest_exceptions (activation_id TEXT REFERENCES activations(id), date TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY(activation_id,date));
    CREATE TABLE sessions (id TEXT PRIMARY KEY, activation_id TEXT NOT NULL REFERENCES activations(id), date TEXT NOT NULL, completed_at TEXT, data TEXT NOT NULL, UNIQUE(activation_id,date));
    CREATE UNIQUE INDEX one_running_session ON sessions((1)) WHERE completed_at IS NULL;
    CREATE INDEX sessions_by_date ON sessions(date);
    CREATE TABLE sets (session_id TEXT NOT NULL REFERENCES sessions(id), exercise_id TEXT NOT NULL, ordinal INTEGER NOT NULL, data TEXT NOT NULL, PRIMARY KEY(session_id,exercise_id,ordinal));
    CREATE TABLE xp_events (id TEXT PRIMARY KEY, session_id TEXT NOT NULL UNIQUE REFERENCES sessions(id), data TEXT NOT NULL);
    CREATE TABLE recovery_backups (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, data TEXT NOT NULL);
    PRAGMA user_version = 1;
  `));
}
