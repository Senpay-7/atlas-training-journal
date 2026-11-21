# Exercise illustrations

ATLAS bundles 16 unmodified PNG illustrations from [Workout Guide by Bryl Lim](https://github.com/bryllim/workout-guide), with original pose artwork by [Everkinetic / Greg Priday](https://github.com/everkinetic/data). Visual assets are licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), as stated in the upstream LICENSE-ASSETS and per-frame manifest. They are separate from ATLAS code and original exercise instructions.

Pinned source revision: `aac599224bb9780305239607ef98540b7e0ce389`. Checked 12 October 2026. `exercise-media.json` preserves exact source URLs, original author/derivative notices and SHA-256 for every included file. The upstream licensing/attribution notices are retained alongside this file. UI credits appear in exercise details and Profile → Sources. There is no implied endorsement by these authors.

Files are copied byte-for-byte and proportionally scaled at display time, without recoloring or cropping. Redistributed visual assets retain CC BY-SA 4.0. The app does not bundle the upstream software package or execute its code.

All 16 selected pictures were visually inspected for movement/equipment correspondence. They show one pose only and are not presented as a complete technique demonstration, start/end sequence or video. The weighted split-squat illustration was deliberately excluded because the ATLAS starter exercise uses bodyweight. A labelled fallback remains for that exercise.

Reproduce the pinned download with `node scripts/import-exercise-media.mjs` (network needed); this script never runs at application startup. Native assets are bundled using literal React Native `require()` calls. Existing records/backups are not changed and images need no database migration.
