# Daycounter migration investigation

Read-only source inspected on 2026-10-10 at `%USERPROFILE%\Documents\Codex\2026-09-18\new-chat`. Relevant files: `lib/training.ts`, `lib/storage.ts`, `lib/exercises.ts`, README, `tests/schedule.test.mjs`, `tests/splits.test.mjs`. Forty-three schedule/split tests pass in the current environment. No original files, database or deployment were modified. No live user export was accessed.

Observed format: `app: daycounter`, `exportVersion: 3`, `version: 3`, start, revision, done, anchors, extraRest (keep/shift), intensities, completed snapshots, splitTransitions, splitDefinitions and splitDefinitionsVersion. Extra timer/preferences fields may exist in real exports and need preservation, not silent dropping.

Actual cycle definitions:

- fiveDay: legs_abs, chest_back, arms_shoulders, rest, legs_abs, chest_back, rest (7 days).
- fourDay: chest_biceps_shoulders, rest, back_triceps, rest, legs_abs, rest, shoulders_arms, rest (8 days).
- threeDay: chest_biceps_shoulders, rest, back_triceps, rest, legs_abs, rest (6 days).
- hussein-fht-4-day: chest_biceps_shoulders, back_triceps, rest, legs_abs, rest, shoulders_arms, rest (7 days). Creator attribution is based on supplied structure, not independently verified footage.

The server storage adapter uses Cloudflare D1. ATLAS must consume a downloaded export rather than depend on that server. Existing v1/v2 migration logic freezes older rotating-split history before applying newer cycles; reuse those semantics, not just present-day templates. Daycounter manual alignment can explicitly update a completion on the aligned date. Preserve the final exported completion snapshot exactly rather than recomputing it from a changed schedule.

## Importer contract — next milestone

1. Validate app/export version and every date/type; retain original source bytes and hash.
2. Use the legacy migration behavior to normalize old versions without changing the original file.
3. Preview workout/rest counts, actual split definitions, transitions, anchors, exceptions, unknown fields and missing performance data.
4. Map stable source IDs such as `daycounter:<export-origin>:<date>`; use content hashes and collision reports for repeated imports.
5. Back up ATLAS, import transactionally and verify totals. Do not invent sets, weights, personal records or XP for completion-only legacy entries.
6. Preserve historical rest completions separately from training sessions. Current ATLAS session schema requires exercise snapshots/sets, so it must be extended before importing those legacy summaries.
7. Provide a recovery report and retry-safe import identities. Respect revision conflicts if obtaining an export through the legacy server.

The legacy importer and its schema extension are not implemented yet. The current JSON restore accepts ATLAS v1 only and rejects Daycounter files. A genuine user export is still needed for final end-to-end migration verification; source code alone does not establish the user's record counts.
