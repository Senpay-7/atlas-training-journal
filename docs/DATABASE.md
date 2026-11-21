# Database

`atlas.db` uses SQLite with foreign keys enabled, WAL and transactional schema versioning via `PRAGMA user_version`. Version 1 creates settings, profile, exercises, programs, activations, rest_exceptions, sessions, sets, xp_events and recovery_backups.

Catalog and user programs have different owners. Seeding uses upserts and does not delete personal records. Activation snapshots freeze the selected template/version. Sessions snapshot exercise names, instructions and targets; set rows are saved immediately on explicit Save set. Text still being typed is a draft until saved.

Constraints: one active session, one session per activation/date in this milestone, unique set ordinal per exercise/session, one XP event per session. Completion and XP insertion commit in one transaction. Repeated completion returns the existing event. Completed sets cannot be silently rewritten.

Backup restore validates schema, dates, uniqueness, references, completion/reward consistency and required installed exercises before writing. It creates a recovery backup and replaces user records inside one transaction. An error rolls everything back. Repeated replacement restore is idempotent. It is not a merge importer.

Program edits compare the incoming version with the current saved version inside a transaction; stale edits are rejected instead of overwriting a newer plan. New prescription weight/notes are additive JSON fields, so SQL schema version remains 1. Exports now use backup format 3 for the expanded theme preferences. This version can restore formats 1, 2 and 3; legacy recovery copies remain usable. Active-session target edits preserve logged sets and never alter the activated program or completed history. Optional cloud sync uses separate Postgres tables and a revision-checked RPC; see CLOUD_SETUP_RU.md.

Profile gradients are IDs, not executable styling. No external media is stored in this milestone. Future schema migrations add profile asset metadata, per-record translations, source/media/pack tables and version history; never reset the database to add features. Unknown future DB versions fail closed.

Platform boundary: native SQLite is the intended durable storage. Web SQLite uses browser OPFS with cross-origin isolation, can be cleared by browser storage management, and needs separate multi-tab, quota and long-history tests.
