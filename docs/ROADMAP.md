# Milestone status

## Delivered in 0.1

Investigation, content-source audit, legacy format investigation, architecture and a runnable native project foundation. Functional slice includes program selection, original starter exercises/templates, immediate set persistence, session recovery, calendar/rest preview, completion/history/XP, personal copies, profile gradients, localization, settings and backup/restore.

This begins both supplied specifications. It does not complete every acceptance criterion or the 30–50-program content target.

## Next milestones

1. **Mobile reliability and profile assets:** device/emulator tests, native crop editor with pinch/pan, exact preview/export matching, 1920×640 local image persistence, avatar picker and portable asset backups. Test keyboard/safe areas and reduced motion on real devices.
2. **Extend workout customization:** the visual builder now creates programs from scratch and edits individual days/exercises, targets, notes and repeating cycles. Remaining: drag-and-drop, supersets/circuits, custom exercises, progression rules, persistent unfinished drafts and live-session-only editing.
3. **Scheduling and migration:** Change Day, fixed-weekday/asynchronous strategies, availability, smart transition with explanations, multi-session dates; Daycounter importer with true legacy fixtures and a real export.
4. **Catalog and packs:** 30–50 curated programs, licensed/attributed media, movement alternatives, pack schema/checksums/dependencies, batch import reports, creator source verification. No paid program replication.
5. **Progression depth:** event reconciliation for explicit workout corrections/deletions, richer quests and achievements, daily planned-workout quests, character customization, original level-up animation and optional haptics. No extra-volume XP rewards.
6. **Scale and release:** asynchronous pagination and indexing, migration upgrade fixtures, long-history load testing, analytics/PR detection, graceful corruption/recovery flows, offline device relaunch tests, native E2E, Android APK/AAB and iOS signing/release validation.

## Explicit current limits

- No APK/IPA, signed build, store submission or physical-device validation yet.
- No photos/videos, body map, image cropper, advanced game combat or 3D avatar.
- Four source-independent programs and seventeen exercises; scientific/editorial review should precede public release.
- Builder supports individual strength prescriptions and repeating cycles; advanced modalities and live-session editing remain pending. Unsaved editor drafts are held in memory and are lost on reload/process termination; closing through the UI asks before discarding edits.
- Only kilogram-based strength sets; conditioning/timed/distance modalities remain pending.
- Completion requires all prescribed sets. Editing/deleting completed history is not exposed yet; add explicit audit/reward correction rules first.
- Rest timer resumes correctly while the app remains alive but is not restored after process termination; saved sets and sessions are.
- History lists/read models are not yet paginated; synchronous web SQLite responses have an upstream size limit.
- No multi-tab coordination guarantee or browser offline installation. Native offline behavior still needs device verification.
- Replacing a backup is supported; merging unrelated backups and Daycounter import are not.
- Technical error details still fall back to English; full localized recovery UX remains to be polished.

## Visual rollout — approval boundary

The first visual iteration covers Home, shared typography/controls and bottom navigation. On 12 October 2026 the user requested dark blue instead of green and more exercise visuals: this pass adds navy tokens and 16 licensed static illustrations in existing Home, Explore/details, Tracker and builder/preview surfaces. Other screen composition changes, photos/video, profile assets and additional motion effects still wait for approval. Do not automatically proceed through the entire visual-overhaul specification.
