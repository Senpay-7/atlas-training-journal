# ATLAS

> Personal project, built with AI coding assistants under my direction: I set the requirements, reviewed the code, ran the tests and fixed the defects.

A native Expo / React Native training journal with local SQLite storage. Version 0.2 adds compact workout cards, draft motion previews, three themes and optional cloud integration. This is a local review build, not a published production release.

**Start here (Russian): [local release and review guide](docs/LOCAL_RELEASE_RU.md).** Account configuration: [Supabase setup](docs/CLOUD_SETUP_RU.md). Product decisions and monetization: [platform plan](docs/PLATFORM_AND_PRODUCT_PLAN_RU.md).

## Run

Use Node 24 LTS and npm. No account, API key, server database or subscription is needed.

```sh
npm ci
npm start
```

Open on an Android device with a compatible Expo client, or use an Expo development build. For iOS, use a compatible client or a development build made on macOS / EAS. Availability of the store version of Expo Go can lag behind the SDK. No cloud build has been requested or performed.

```sh
npm run typecheck
npm test
npx expo-doctor
npm run build:web
npm run preview
```

The browser preview is at http://127.0.0.1:8085. It serves the cross-origin isolation headers needed for Expo SQLite WASM. The mobile app uses native SQLite. Browser support is a development preview: a hosted offline PWA, service worker and production browser persistence guarantees are not part of this milestone.

**Windows: open the existing build by double-clicking `Open-ATLAS.cmd`.** It starts the local server in the background if needed and opens the default browser. Running it again reuses the same server and browser address, preserving access to the same local data. After a computer restart, launch this file again. Logs are in `.tooling/preview-server.log`. No Windows startup task is installed. For a server-only launch: `node scripts/launch-preview.mjs --no-open`.

This machine has a bundled Node runtime but no global npm command. `scripts/windows.ps1` locates npm from PATH or the already installed local tooling and exposes a temporary npm wrapper to child processes. Example: `powershell -ExecutionPolicy Bypass -File scripts/windows.ps1 start`. The policy flag applies only to this invocation; it does not change machine policy.

## Available now

- Five tabs, Home in the center; four navigation presentations.
- Ukrainian by default, English and Russian; navy/white/black themes and reduced motion.
- Local profile, biography and ten 3:1 gradient banners.
- Seventeen original exercise descriptions and fourteen original training templates with source notes.
- Two clearly labelled AI draft three-frame motion previews; a third push-up sheet is retained for review only.
- Compact workout cards, tap-to-log sheets and per-exercise / split settings menus. Safe changes to today's targets and replacements preserve saved sets and completed history.
- Optional Supabase email-code / Google PKCE UI, manual revision-checked snapshot transfer, RLS SQL and 20 cloud recovery revisions. Not connected to a hosted project yet.
- Chrome/Edge MV3 website companion with no account tokens or workout database of its own. Local package; not installed or published to stores.
- Program activation with manual starting position; rolling cycles and a seven-day preview.
- Extra Rest with Keep / Shift previews and undo.
- Program builder: create from scratch, customize or duplicate a personal copy; edit days, exercises, sets/reps/rest, target weight and notes; reorder with buttons and arrange repeating cycles with recovery days.
- Explicit version activation, stale-edit protection, validation and unsaved-change confirmation.
- Refined Home, workout cards, shared controls and navigation with motion and reduced-motion support.
- Saved sets, restart recovery, protected completed sessions, history and logged volume.
- Transactional workout completion and XP; one rewarded workout per calendar date.
- Level calculation, weekly quest counter and first-workout achievement.
- JSON export/validated replacement restore with recovery copy; CSV export.

## Read next

- [Research and content decisions](docs/SOURCE_AUDIT_RU.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [Program format](docs/PROGRAM_FORMAT.md)
- [Schedule rules](docs/SCHEDULING.md)
- [Content packs](docs/CONTENT_PACKS.md)
- [Media licensing](docs/MEDIA_LICENSING.md)
- [Legacy migration](docs/LEGACY_MIGRATION.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Visual review and staged redesign](docs/VISUAL_REVIEW_RU.md)
- [Testing](docs/TESTING.md)
- [Verified results and limits](docs/VALIDATION.md)
- [Remaining work](docs/ROADMAP.md)

The original Daycounter repository is untouched. No user training records have been imported. Sixteen exercise illustrations are bundled with attribution (see `docs/licenses/README.md`); static illustrations are not complete technique demonstrations. No paid creator program or disputed exercise image has been copied.

### Dependency patch

`postinstall` applies a one-line, version-guarded fix to `expo-sqlite@57.0.4`'s web worker response-length serialization. Without it, responses larger than 255 bytes are truncated and SQLite initialization fails in the browser. See `scripts/patch-sqlite-web.mjs`. Native platforms are unaffected. Review/remove this patch when upgrading; it intentionally refuses unknown versions. The upstream synchronous web bridge also has a 1 MiB result buffer: the large-history milestone must replace synchronous bulk reads with asynchronous, paginated repository queries.
