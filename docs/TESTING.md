# Verification

Run `npm run typecheck`, `npm test`, `npx expo-doctor`, and `npx expo export --platform all`.

The Vitest suite uses real Node SQLite, not an in-memory object mock. It covers initial seeding, reinitialization, personal copies, interrupted-session restoration, immediately committed sets, invalid input, incomplete completion, duplicate XP, immutable history, transaction rollback on simulated reward failure, backup round trips, repeated restore, corrupt references, restore rollback, date arithmetic, Keep/Shift exceptions and level thresholds.

Version 0.2 passes 39 tests, including PostgreSQL WASM (PGlite) execution of the actual migration, role permissions/RLS, revision conflicts, recovery-version retention, cloud response limits and extension URL validation. Node SQLite tests cover today-only target changes, protection of logged sets, all three themes and all 14 templates. Native bundle export and browser review are recorded in RELEASE_02_VERIFICATION.md. Twenty-eight tests passed after the earlier builder and first visual pass. Added cases cover custom-plan persistence, replacement/reordering, stale-edit protection, target/notes preservation in snapshots and backups, legacy backup compatibility, invalid drafts, deleted-day cycle semantics and current-week boundaries. Earlier baseline results remain in [VALIDATION.md](VALIDATION.md); the visual pass is documented in [VISUAL_REVIEW_RU.md](VISUAL_REVIEW_RU.md). Forty-three original Daycounter schedule/split tests were previously run read-only as migration research.

Expo Doctor initially identified the TypeScript version mismatch; it was corrected to the supported 6.0.3 range, and 21/21 checks passed. The local machine's missing global npm command is handled by a temporary project-local wrapper, not a system-wide installation.

Browser QA must verify first launch, program activation, save-set/reload, completing a workout, language/theme/navigation changes, source/detail screens and export/restore behavior. Test at phone width and inspect actual rendering. The web adapter needs COOP/COEP headers; `scripts/preview.mjs` provides them.

Native bundle export checks module resolution and compilation. It does **not** validate a signed native binary, phone performance, Android/iOS lifecycle, native file permissions or long-term offline persistence. Add device E2E before calling a release ready.
