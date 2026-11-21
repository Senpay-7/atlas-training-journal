# ATLAS 0.2 verification · 14 October 2026

## Automated checks

- TypeScript `tsc --noEmit`: passed.
- Vitest 5.0.4: **39/39 passed** across three files.
- 32 real Node SQLite/domain tests: catalog/seed preservation, all 14 localized templates, active-session edits and replacement, logged-set guards, completed history, v1/v2 imports and v3 exports, themes, builder, scheduling, XP and rollback.
- 5 PGlite tests: executes the actual PostgreSQL migration with simulated Auth users/roles. Verifies RLS, direct-write prohibition, expected-account check, revision conflict, size checks, 20-version retention and client response validation. These do not test hosted Supabase Auth/JWT or network delivery.
- 2 extension tests: allowed HTTPS/loopback origins, forbidden credentials/paths/schemes, local scripts and storage-only permission.
- Expo export: **web, Android and iOS succeeded**. Native outputs are JS/Hermes bundles, not signed/installable packages.
- `expo install --check` reports dependencies up to date against the bundled compatibility data; it warned that online validation was unavailable in offline mode. This is not a new full online Expo Doctor run.
- Packaged HTML asset references and COOP/COEP headers checked; extension and packaging JavaScript syntax checks pass.

## Browser observations

Inspected the existing `127.0.0.1:8085` app without changing its current workout's sets, targets, activations or history. Confirmed 14 plans, visible split menus, compact targets, a separate two-field log sheet, target editor/replacement choices, generated draft preview with Play/Pause/frame controls, all three themes, RU/UK/EN switching and cloud-unconfigured state. Reduced motion produced Play instead of automatic playback. Restored the original English/navy/normal-motion preferences; navigation preset preserved.

Screenshots in `docs/visual-review/02-*.jpg` cover a 390px phone viewport. Rechecked narrow layout at 320px. User records were not overwritten for an end-to-end save/completion test; those write paths are covered with real SQLite. An isolated localhost browser attempt was blocked by the browser (`ERR_BLOCKED_BY_CLIENT`), so no browser write test is claimed. The preview remains on its original address.

## Dependency audit

The original npm audit reported **32 findings: 2 critical, 18 high, 12 moderate**. Updated development-only Vitest from 3 to 5.0.4, removing the two critical findings and the related mocker issue; all tests still pass. The install audit now reports **29 findings: 0 critical, 18 high, 11 moderate**.

Remaining notices include transitive `braces`, `node-forge`, `uuid` and `decode-uri-component` in the Expo/React Native toolchain/router dependency tree; several parent packages repeat the same underlying notices. npm suggested major Expo/React Native downgrades or a newer router major for some fixes. No forced framework downgrade or unverified override was applied. This build is for local review; dependency remediation and a fresh audit remain a release requirement. Detailed original audit is in `.tooling/audit-0.2.json`.

## Not yet verified or released

- No domain, Supabase project, Google OAuth client or SMTP configured. No live login, email delivery or two-device network sync verified.
- Sync is manual and chooses a complete copy. No background merge. Device data remains after sign-out; account-specific local database separation is a future step.
- Extension packaged as a website companion; not installed into Chrome/Edge or submitted to stores.
- No APK/AAB/IPA built or installed. Phone lifecycle, auth deep links and secure storage need real-device tests.
- Two generated three-pose sequences are labelled drafts. The third push-up sheet is review-only. No continuous video or coach approval is claimed.
- Current cloud beta limit is 500 KB; synchronous SQLite web bulk reads still need redesign for large histories. No production PWA/offline caching guarantee.

Setup, packaging and release boundaries: `LOCAL_RELEASE_RU.md`, `CLOUD_SETUP_RU.md`, `PLATFORM_AND_PRODUCT_PLAN_RU.md`.
