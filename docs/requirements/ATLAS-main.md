# PROJECT ATLAS — Complete Modular Fitness & Workout Tracking Application

## 0. YOUR ROLE AND MISSION

You are acting as a senior software architect, React Native engineer, mobile UI/UX designer, database engineer, fitness programming researcher, QA engineer and product designer.

Your task is to **design and implement a completely new, production-oriented modular fitness application**, provisionally named **ATLAS**.

ATLAS is a universal workout and training platform combining:

- An extensive library of workout splits and professional training methods.
- Workout programs associated with athletes, coaches, fitness educators and content creators.
- A powerful workout tracker and intelligent scheduling system.
- A comprehensive exercise encyclopedia with demonstrations.
- A visual workout-plan builder.
- Offline-first storage and data portability.
- Personal profiles, statistics, records and achievements.
- Highly customizable, modern mobile UI with Apple-inspired liquid-glass design.
- A modular architecture that allows individual features to be redesigned, extended or replaced independently.

This is **not a simple workout logging app**.

It should be designed as a long-term, extensible fitness ecosystem.

The user should be able to install the app, open it and begin using it immediately, without creating an account, setting up a database, purchasing a subscription or connecting to an external service.

**IMPORTANT: This is a NEW project. Do not refactor or overwrite the existing Daycounter project. Treat Daycounter as a legacy product and potential migration source.**

---

# 1. PRODUCT VISION

ATLAS should combine the strongest practical concepts found in modern training applications while having its own original identity.

The product must help users:

1. Discover suitable workout routines.
2. Explore different training methods.
3. Compare programs and training splits.
4. Learn correct exercise techniques.
5. Create completely custom training plans.
6. Track exercises, sets, repetitions, weights and rest periods.
7. Monitor progress over weeks, months and years.
8. Switch between different programs without losing previous records.
9. Manage flexible schedules and recovery days.
10. Personalize the interface and their fitness profile.
11. Use the application reliably without internet access.
12. Import and export their training data without vendor lock-in.

The application must support beginners, intermediate athletes and advanced users, including people training for bodybuilding, powerlifting, strength, hypertrophy, calisthenics, functional fitness, general fitness and athletic conditioning.

Avoid unnecessary complexity in the everyday user experience. Advanced functionality should be available through progressive disclosure.

---

# 2. TECHNOLOGY STACK

The preferred technical foundation is:

- React Native.
- Expo.
- TypeScript with strict typing.
- Expo Router for routing.
- SQLite for local persistent storage.
- Drizzle ORM or a similarly well-supported typed SQLite solution.
- Zustand or an equally lightweight state management solution.
- TanStack Query only where asynchronous data synchronization is genuinely required.
- React Native Reanimated for high-performance animations.
- React Native Gesture Handler for gestures.
- A maintained UI and graphics solution compatible with Expo for blur, gradients and custom visual effects.
- Zod for validating imported content, serialized data and externally obtained records.
- An internationalization solution supporting future expansion.
- Jest/Vitest for domain logic and component testing, plus suitable mobile E2E testing.

Verify all package versions and Expo compatibility before installing dependencies.

Avoid introducing libraries that do not have a clear purpose.

Do not add Firebase, Supabase, Clerk, Auth0, mandatory cloud services or paid API dependencies to the core product.

Android and iOS are first-class targets. Design shared domain logic so web or desktop support can be added later without rewriting the application.

The app must not simply be an existing website wrapped in a WebView.

---

# 3. NON-NEGOTIABLE ARCHITECTURAL REQUIREMENT: MODULARITY

The entire application must use a **modular, feature-based architecture** with clear boundaries.

Every major subsystem should own its business logic, data access interfaces, screens, components and tests.

The main modules should include:

1. **Core** — application lifecycle, configuration, navigation contracts and initialization.
2. **Design System** — colors, themes, typography, spacing, glass components and animations.
3. **Home Dashboard** — overview of active programs and daily activity.
4. **Program Library** — catalog of available training splits and plans.
5. **Program Builder** — custom routine creation and editing.
6. **Workout Tracker** — recording workouts, sets, weights and workout results.
7. **Scheduling Engine** — schedules, rest days, calendar and plan transitions.
8. **Exercise Library** — exercise metadata, instructions, filtering and demonstrations.
9. **Exercise Media** — images, video, animations, caching and licensing metadata.
10. **Analytics** — statistics, personal records and charts.
11. **Profile** — athlete profile and visual customization.
12. **Achievements** — milestones, challenges and personal badges.
13. **Content Packs** — installation and updating of exercise and routine collections.
14. **Import/Export** — backup, restore and legacy migration.
15. **Settings** — application behavior and preferences.
16. **Optional Integrations** — future cloud sync, wearables, external services and social features.

Modules must communicate through typed contracts, public services and domain events where appropriate.

Do not allow random cross-module imports into implementation details.

Use dependency inversion for storage, media, scheduling and synchronization providers.

Create a structure resembling:

    src/
      app/
      core/
        bootstrap/
        config/
        navigation/
        contracts/
      domain/
        exercises/
        programs/
        workouts/
        scheduling/
        analytics/
      features/
        home/
        discover/
        program-library/
        program-builder/
        workout-tracker/
        calendar/
        exercise-library/
        analytics/
        profile/
        achievements/
        settings/
      data/
        sqlite/
        migrations/
        repositories/
        seeds/
      content/
        packages/
        manifests/
        validators/
      services/
        import-export/
        media/
        notifications/
      design-system/
        tokens/
        components/
        themes/
        animations/
        navigation/
      localization/
      shared/
        hooks/
        types/
        utils/
    assets/
    scripts/
    tests/
    docs/

This structure is a starting recommendation, not an excuse to create unnecessary abstractions.

Each feature must expose a documented public API.

It must be possible to:

- Replace the Profile UI without changing workout tracking.
- Add a new navigation design without changing individual screens.
- Add a training style without rewriting the scheduling engine.
- Install new exercise content without modifying database logic.
- Replace locally generated exercise animations with licensed video assets.
- Introduce optional cloud synchronization without rewriting offline repositories.
- Change the analytics presentation without changing the underlying workout history.

Avoid circular dependencies, giant components, duplicated business rules and monolithic application state.

A single source of truth must exist for each important domain concept.

**The goal is modularity that is actually maintainable, not overengineered architecture with hundreds of meaningless files.**

---

# 4. LOCAL DATABASE AND OFFLINE-FIRST EXPERIENCE

ATLAS must work without an account or server.

On first launch, the application should automatically:

1. Initialize a local SQLite database.
2. Run the required database migrations.
3. Load bundled exercise data and workout programs.
4. Create a local user profile.
5. Initialize default preferences.
6. Present the Home screen or optional onboarding.

No internet connection is required.

## Database architecture

Keep different data categories logically separated:

- System catalog data.
- Installed content-pack data.
- User-created exercises.
- User-created programs.
- User-modified program copies.
- Active program configuration.
- Scheduled workouts.
- Completed workout history.
- Exercise performance and set records.
- Program transition history.
- Calendar exceptions.
- Profile preferences.
- Achievements.
- Media metadata.
- Migration and backup metadata.

Develop a normalized and versioned database schema.

At minimum, design entities for:

- UserProfile
- UserPreferences
- Exercise
- ExerciseTranslation
- ExerciseMedia
- ExerciseVariant
- ExerciseRelationship
- TrainingProgram
- ProgramVersion
- ProgramDay
- ProgramExercise
- ProgramBlock
- ProgramSource
- ProgramActivation
- ProgramTransition
- ScheduleRule
- ScheduleException
- WorkoutSession
- ExercisePerformance
- SetPerformance
- PersonalRecord
- BodyMeasurement
- Achievement
- UserAchievement
- ContentPack
- ContentPackVersion
- MigrationRecord

Use stable unique identifiers and clear foreign-key relationships.

Training logs and session results should be immutable historical records except when a user explicitly edits or deletes them.

Routine templates must be versioned.

Editing an active program must not unexpectedly modify previously completed workouts.

Use snapshots or explicit version references where required.

### Critical persistence rules

- Persist completed sets immediately.
- Restore interrupted sessions after application restart.
- Do not lose data when the app is backgrounded or terminated.
- Run migrations transactionally where possible.
- Provide safe recovery from failed content imports.
- Avoid deleting user data when bundled exercise content is updated.
- Distinguish user-owned data from replaceable catalog data.
- Preserve local data during application updates.
- Implement backup and restore from the beginning.

Provide exports in JSON and CSV, and optionally a single portable archive containing metadata and available user-owned assets.

Support validation, preview, duplicate detection, import reports and rollback or recovery before replacing existing data.

An optional cloud-sync adapter may be developed later, but it must never be required for normal use.

---

# 5. MIGRATION FROM THE EXISTING DAYCOUNTER PROJECT

The user already has an existing project called **Daycounter**.

This project contains valuable functionality and training history.

The new application must support reuse of this functionality and import of existing data.

If the legacy repository is accessible, inspect it thoroughly before implementation.

If it is not accessible, create a documented migration contract and importer, and clearly identify what source files are needed. Do not pretend that you inspected unavailable code.

Do not modify the original Daycounter repository without explicit authorization.

## Existing functionality to preserve

Daycounter already includes or has previously been designed around:

- Three-day workout splits.
- Four-day workout splits.
- Five-day workout splits.
- Intelligent program transitions.
- Recommendation of the most appropriate next workout.
- Manual selection of the starting workout.
- Calendar-based workout planning.
- Change Day.
- Extra Rest.
- Rest-day behavior that can preserve or shift the schedule.
- Completion tracking.
- Upcoming workout prediction.
- Split-change history.
- Workout history.
- Statistics.
- Persistent preferences.
- Backup/export.
- Offline and PWA-related functionality.
- Handling potential synchronization or multi-tab conflicts.

Do not casually reimplement these features and lose existing edge-case behavior.

Extract their underlying domain rules into the new modular architecture.

## Existing five-day program example

The previous system included a repeating schedule resembling:

1. Legs + Abs.
2. Chest + Back.
3. Arms + Shoulders.
4. Rest.
5. Legs + Abs.
6. Chest + Back.
7. Rest.

This must be representable as structured data rather than hardcoded application logic.

Also support the previous three-day and four-day definitions if recoverable from the legacy repository.

## Migration requirements

Support import of:

- Historical completed workouts.
- Training dates.
- Current and previous active programs.
- Program transitions.
- Schedule anchor and cycle position.
- Completed training-day statuses.
- Rest-day exceptions.
- Calendar changes.
- Workout performance records, if available.
- Training statistics or sufficient raw records to recalculate them.
- User settings and preferences.

Provide a migration preview:

"Found 124 completed workouts, 3 program definitions, 6 schedule exceptions..."

This is an illustrative UI example, not actual user data.

The migration process must:

1. Parse the source data.
2. Validate the schema.
3. Produce a conversion preview.
4. Back up the current destination data.
5. Import records transactionally.
6. Avoid duplicate historical workouts.
7. Preserve original identifiers where appropriate.
8. Verify historical totals.
9. Provide an import report.

Repeated imports must be safe and idempotent.

If the existing project uses a server, provide a supported export/import migration path. Do not make the new application permanently dependent on that legacy server.

---

# 6. WORKOUT PROGRAM LIBRARY — THE MAIN PRODUCT DIFFERENTIATOR

Create a **large, extensible and curated training-program library**.

Do not limit this to a few common routines.

The architecture must support hundreds or thousands of future entries, with filtering and versioning.

However, actual program entries must be useful and honest. Avoid filling the catalog with duplicated or fabricated routines to achieve an artificial number.

## Core bodybuilding splits

Include families such as:

- Full Body — 2, 3, 4 and 5-day options.
- Upper / Lower — 2, 4 and 6-day variants.
- Push / Pull / Legs — 3, 5 and 6-day variants.
- Push / Pull / Legs / Upper / Lower.
- Arnold Split.
- Arnold-style 6-day training.
- Traditional Bro Split.
- Chest / Back / Legs / Shoulders / Arms.
- Torso / Limbs.
- Upper / Lower / Arms.
- Chest + Back focused splits.
- Arms + Shoulders focused splits.
- Antagonist muscle-group splits.
- Frequency-oriented hypertrophy splits.
- Low-volume, high-intensity variants.
- High-frequency training approaches.
- Specialization blocks for individual muscle groups.
- Asynchronous or rolling training cycles.

## Strength and powerlifting

Support program families such as:

- 5x5 training.
- Linear progression.
- Heavy / Light / Medium methods.
- 5/3/1-style progression.
- Upper / Lower strength programs.
- Powerbuilding.
- Squat specialization.
- Bench press specialization.
- Deadlift emphasis.
- DUP-style training.
- Block periodization.
- Peaking and deload cycles.

Only reproduce exact branded or commercial program details where legally permitted.

## Other training categories

Include:

- Calisthenics.
- Street workout.
- Bodyweight strength.
- Beginner gym programs.
- Home workouts.
- Dumbbell-only workouts.
- Kettlebell programs.
- Functional fitness.
- CrossFit-style conditioning.
- HIIT.
- Circuit training.
- Mobility and flexibility.
- Athletic performance.
- Explosive power and plyometrics.
- General fitness.
- Hybrid strength and endurance.
- Recovery and deload templates.

Do not force all categories into a traditional bodybuilding split model.

For example, a CrossFit-style session may need AMRAP, EMOM, For Time, rounds, distance, calories, scaling and workout scoring rather than sets × repetitions × weight alone.

## Support different program structures

A program can be:

- Fixed weekly.
- Rolling/asynchronous.
- Alternating A/B.
- Training-day-based, independent of weekdays.
- Multiweek.
- Multiphase.
- Goal-based.
- Time-limited.
- Continuous.
- Custom scheduled.
- Periodized.
- Composed of mixed training modalities.

It must support multiple sessions per day and optional conditioning or mobility blocks.

Rest days are explicit entities rather than fake workouts.

---

# 7. ATHLETE, COACH AND CONTENT-CREATOR PROGRAM COLLECTIONS

One of the most important parts of the application is a discoverable library of training approaches associated with recognizable fitness personalities.

Research public information from:

- Official athlete websites.
- Official YouTube channels.
- Public TikTok videos.
- Public Instagram training posts.
- Official coaching websites.
- Interviews and publicly available training demonstrations.
- Fitness education organizations.
- Reputable bodybuilding and strength-training resources.

Candidate athlete and educator collections include:

- Chris Bumstead (CBum).
- Arnold Schwarzenegger.
- Ronnie Coleman.
- Jay Cutler.
- Dorian Yates.
- Mike Mentzer.
- Jeff Nippard.
- Dr. Mike Israetel / Renaissance Periodization.
- Samson Dauda.
- Derek Lunsford.
- David Laid.
- Influential calisthenics and functional fitness athletes.
- Popular TikTok and YouTube fitness educators.

Also investigate the creator previously discussed as **Hussein FHT**, provided reliable source identification is possible.

The previously discussed Hussein-style four-day structure was:

1. Chest / Biceps / Shoulders.
2. Back / Triceps.
3. Legs / Abs.
4. Shoulders / Arms.

Treat this as previously supplied structure, not independently verified creator programming. Verify its original source before labeling it official.

This list is for research and catalog organization. It does not establish endorsement, partnership or permission to reproduce paid products.

## Critical: source integrity

Implement three explicit source classes.

### A. Verified Original

The exact program structure is confirmed through a legitimate public primary source.

Show:

- Creator name.
- Original program title.
- Source URL.
- Date or period.
- Verification status.
- Program structure.
- Officially disclosed details.

### B. Publicly Demonstrated

The athlete demonstrated training sessions or parts of a split publicly, but there is insufficient evidence to reconstruct a complete official routine.

Include only confirmed details.

Mark any missing components as unavailable.

### C. Inspired / Community Template

The template uses publicly known training concepts associated with a training style but is independently constructed.

Clearly say "Inspired by" and never present the program as official or endorsed.

Never invent an exact athlete workout.

Never claim sets, repetitions, exercises or progression schemes are official if they were not publicly verified.

Do not copy or redistribute paid training manuals or subscription-only programs.

For paid programs, a catalog listing and official purchase link can be shown without reproducing protected content.

## Program detail pages

Each program should have:

- Cover image or original branded-style artwork created for ATLAS.
- Name and category.
- Creator or training methodology.
- Source status.
- Description.
- Target experience level.
- Main objective.
- Training frequency.
- Estimated training duration.
- Equipment requirements.
- Primary muscle groups.
- Structure by day.
- Program length.
- Difficulty estimate.
- Tags.
- Training notes.
- Modifications.
- Source links.
- Save/Favorite.
- Preview.
- Start Program.
- Customize a Copy.
- Compare with another program.

Provide two viewing modes where applicable:

**Original Structure** — faithfully shows verified public information.

**Complete Workout** — adds optional, clearly labeled ATLAS suggestions for missing exercises or details.

Suggestions must be differentiated from source material.

## Content quality

Start with a substantial set of genuinely complete, internally consistent routines across multiple training styles.

Target an initial curated collection of roughly 30–50 quality templates, then build scalable content-pack tooling for 100+ and eventually several hundred entries.

The exact count is less important than authenticity, diversity and usefulness.

Each program must have tests or validation confirming that its structure, exercises and scheduling rules are valid.

---

# 8. EXERCISE ENCYCLOPEDIA

Create a dedicated **Exercise Library** containing hundreds of exercise entries over time.

It should become one of the main features of ATLAS.

Each exercise should contain:

- Stable exercise ID.
- Canonical name.
- Localized names.
- Search aliases and synonyms.
- Main muscle groups.
- Secondary muscle groups.
- Equipment.
- Movement pattern.
- Exercise type.
- Difficulty.
- Unilateral or bilateral classification.
- Movement instructions.
- Common mistakes.
- Safety notes.
- Setup instructions.
- Range-of-motion notes where appropriate.
- Exercise variations.
- Alternative exercises.
- Related exercises.
- Supported tracking units.
- Image or animation.
- Optional video demonstration.
- Media licensing details.
- Source information.

## Filtering and discovery

Users must be able to filter by:

- Target muscle.
- Equipment.
- Exercise type.
- Movement pattern.
- Difficulty.
- Training goal.
- Bodyweight versus weighted.
- Gym versus home.
- Available equipment.
- Favorites.
- Custom exercises.

Implement instant search and synonym matching.

Example:

Searching for "bench press", "chest press", "жим лежачи" or "жим лёжа" should return the relevant bench press exercise rather than four unrelated duplicates.

## Anatomical visualization

Design an interactive body map showing:

- Chest.
- Upper and lower back.
- Shoulders.
- Biceps.
- Triceps.
- Forearms.
- Abs.
- Quadriceps.
- Hamstrings.
- Glutes.
- Calves.
- Other relevant muscle groups.

Users should be able to tap a muscle region and browse relevant exercises.

Use appropriately licensed anatomical artwork or original vector illustrations.

The body map should be extensible independently of the exercise database.

---

# 9. EXERCISE IMAGES, ANIMATIONS AND VIDEOS

Visual consistency is essential.

Avoid a catalog where every image has a different background, camera angle, aesthetic and quality.

Provide an exercise media system with multiple providers and fallbacks.

Preferred order:

1. Consistent, original or properly licensed exercise animations.
2. Consistent licensed photo sequences.
3. Licensed short demonstration videos.
4. Official creator-hosted video references.
5. Clean original illustrated placeholders where verified media is unavailable.

## Visual style

Aim for a consistent series of exercise demonstrations:

- Neutral background.
- Clear human figure.
- Full visibility of the movement.
- Stable framing.
- Minimal distractions.
- Consistent lighting.
- Similar aspect ratios.
- Looping animations when appropriate.
- Clear start and end positions.

Support 2-frame demonstration sequences, GIF, WebP, MP4 and appropriate animation formats.

Use local assets where licensing and storage size permit.

Larger media packs may be downloaded voluntarily and cached.

The app should still function with basic instructions and available offline assets when video is unavailable.

## Candidate exercise database sources

Evaluate the following as possible **data sources**, not automatically approved media libraries:

- https://github.com/yuhonas/free-exercise-db
- https://wger.de/
- https://wger.readthedocs.io/
- https://exercisedb.dev/

Review each source's current dataset terms, redistribution rights, image provenance and any share-alike requirements.

The presence of a GitHub repository or a permissive software license does not automatically establish rights to every included photo or animation.

If media rights cannot be verified, do not bundle that media.

Import only content that can be used legitimately.

Create a media manifest recording source, author, license, attribution, local filename, dimensions and checksum.

## Content-creator demonstrations

Support optional media from athletes and content creators, including TikTok and YouTube.

However:

- Do not scrape or download copyrighted videos for redistribution.
- Use supported platform embedding where appropriate.
- On native mobile, open an original creator link or a permitted supported player when direct embedding is unsuitable.
- Attribute the original creator clearly.
- Do not remove watermarks or falsely claim ownership.
- Keep video availability separate from exercise tracking functionality.

Provide support for future creator partnerships and licensed creator media packs.

---

# 10. ADVANCED PROGRAM BUILDER

Users must be able to create their own complete workout programs without writing code.

Implement a dedicated visual Program Builder.

Capabilities:

- Create a new program.
- Start from a template.
- Duplicate an existing program.
- Edit program title and description.
- Select training goal.
- Choose difficulty.
- Define workout days.
- Choose scheduling strategy.
- Add rest days.
- Add exercises from the library.
- Create new exercises.
- Drag and reorder exercises.
- Create warmup blocks.
- Create supersets.
- Create giant sets.
- Create circuits.
- Create drop sets.
- Create timed blocks.
- Set exercise targets.
- Define rest timers.
- Define progression rules.
- Add weekly progression.
- Add deload weeks.
- Set equipment restrictions.
- Select exercise alternatives.
- Add personal notes.
- Attach banners and covers.
- Preview the completed program.

## Program editor

Provide a clean drag-and-drop editor.

For example:

Day 1 — Chest + Back

- Bench Press — 4 × 6–8.
- Incline Dumbbell Press — 3 × 8–12.
- Pull-Ups — 3 × 6–10.
- Chest-Supported Row — 3 × 8–12.

These are illustrative values, not automatically recommended prescriptions for all users.

Let users adjust every parameter.

Offer a lightweight "Quick Create" mode and a more detailed "Advanced Builder" mode.

### Smart exercise replacement

When replacing an exercise, suggest alternatives based on:

- Primary movement pattern.
- Main target muscles.
- Available equipment.
- Training difficulty.
- Similar exercise purpose.

Never automatically replace an exercise if that substitution would materially change training intent without explaining the difference.

---

# 11. INTELLIGENT SCHEDULING ENGINE

The scheduling system is a critical part of ATLAS.

It must be a reusable domain engine with no dependency on React component state or screen layout.

Support at least:

- FIXED_WEEKLY
- ROLLING_CYCLE
- ASYNCHRONOUS
- ALTERNATING
- BLOCK_PERIODIZED
- CUSTOM_CALENDAR

These may be implemented as clean scheduling strategies behind a shared interface.

The system must understand that training plans are not always tied to Monday–Sunday weeks.

Examples:

- Monday, Wednesday, Friday.
- Two days on, one day off.
- Three days on, one day off.
- Four sessions repeated independent of weekdays.
- Five sessions across seven days.
- Eight-day or ten-day cycles.
- Variable rest days.
- Flexible schedules based on availability.

## Change Day

Allow users to modify an upcoming workout day.

Changes must be accurately reflected in:

- Home Dashboard.
- Calendar.
- Up Next.
- Upcoming schedule.
- Plan preview.
- Notifications, when available.

Use one deterministic schedule resolver.

Do not implement separate scheduling calculations in multiple UI components.

## Extra Rest

Support:

**Keep Schedule** — add a rest day without shifting the underlying future schedule, with any affected scheduled workout handled explicitly.

**Shift Schedule** — insert a rest day and shift the relevant future cycle positions.

The exact effects must be previewed before confirmation.

Allow undoing or modifying rest exceptions.

Support multiple consecutive exceptions and exceptional circumstances such as illness, travel or skipped training.

## Smart Transition

When switching from one training plan to another, recommend the best starting day based on actual workout history.

For example:

If the user trained Chest + Back yesterday, and the new split begins with a heavy upper-body session, the engine should evaluate whether Legs or Rest is a more appropriate starting point.

The algorithm should consider:

- Recently trained muscle groups.
- Direct versus secondary muscle involvement.
- Recent workout intensity.
- Volume and effort when available.
- Time since the previous workout.
- Available rest days.
- Current schedule position.
- New program structure.
- User availability.
- Relevant recovery preferences.

Use transparent, configurable heuristics rather than claiming an unvalidated AI system can measure physiological recovery precisely.

Show recommendations with explanations:

"Legs + Abs is suggested because your previous session emphasized Chest + Back."

Allow manual override.

The user must be able to inspect the possible starting positions before activating a new plan.

## History preservation

Changing programs must NEVER overwrite:

- Previous workout sessions.
- Historical calendars.
- Prior program metadata.
- Past program activations.
- Personal records.
- Completed sessions.

Maintain an explicit timeline of program activations and transitions.

## Scheduling edge cases

Test:

- Switching programs midweek.
- Switching immediately after a training day.
- Switching on a rest day.
- Repeating a previously used program.
- Consecutive extra rest days.
- Undoing schedule changes.
- Missed sessions.
- Manual day substitutions.
- Time zone changes.
- Daylight-saving transitions.
- Calendar boundaries.
- Leap years.
- Program templates being edited after activation.

---

# 12. WORKOUT TRACKER

Build a first-class session tracking experience.

The tracker should be fast enough to use between sets in a busy gym.

## Active workout screen

Display:

- Workout name.
- Program name.
- Training timer.
- Current exercises.
- Planned and completed sets.
- Suggested weights from historical performance.
- Exercise images or animations.
- Personal notes.
- Rest countdown.
- Exercise completion indicators.
- Progress within the session.

Each exercise should support:

- Warmup sets.
- Working sets.
- Weight.
- Repetitions.
- RPE.
- Reps in Reserve (RIR).
- Time.
- Distance.
- Bodyweight.
- Assistance weight.
- Weighted bodyweight.
- Tempo, optionally.
- Custom notes.
- Set completion.
- Superset grouping.

Support different schemas for strength workouts, circuits and conditioning sessions.

## Workflow

The user should be able to:

1. Start a planned workout.
2. View their last performance.
3. Enter weight and repetitions.
4. Mark a set complete.
5. Start a rest timer automatically.
6. Move to the next set.
7. Replace an exercise when needed.
8. Add or remove sets.
9. Pause or finish a workout.
10. View a completion summary.

Provide haptic feedback and sensible auto-focus behavior.

Allow undoing mistaken entries.

Support creating an unplanned workout without an active training program.

## Tracking intelligence

Implement:

- Previous performance recall.
- Personal record detection.
- Session volume calculations.
- Time tracking.
- Progression suggestions.
- Estimated one-repetition maximum where appropriate.
- Exercise history.
- Optional personal targets.
- Optional training reminders.

Suggestions must be user-configurable.

Never force heavier weights simply because a workout has been completed.

The application should work even when the device loses connectivity or closes unexpectedly.

---

# 13. HOME DASHBOARD

The Home screen is the central hub of the application.

It must be visually attractive but highly functional.

Suggested layout:

### Upper area

- Personalized greeting.
- Current date.
- Small profile avatar.
- Quick access to notifications/settings.
- Active program indicator.

### Primary card

Large, visually prominent "Today's Workout" card.

Display:

- Workout title.
- Main muscle groups.
- Estimated duration.
- Training type.
- Relevant visual.
- Start Workout button.
- Rest-day status where applicable.

### Quick actions

- Start workout.
- Explore programs.
- Create program.
- Add rest day.
- Change today's workout.

### Secondary cards

- Current split.
- Weekly training completion.
- Training streak.
- Recent personal record.
- Up Next.
- Training calendar preview.
- Muscle-group activity.
- Recent session history.

Users should be able to rearrange dashboard widgets and hide unwanted cards.

Provide a widget registry so new card types can be introduced without rebuilding the entire dashboard.

---

# 14. BOTTOM NAVIGATION — APPLE-INSPIRED GLASS DESIGN

Create a distinctive mobile bottom navigation component inspired by the supplied visual reference.

The reference depicts a horizontally oriented rounded navigation capsule with:

- A soft blue translucent background.
- Very large rounded corners.
- Four evenly arranged icon-and-label buttons.
- White inactive icons and labels.
- A circular or oval highlighted active button.
- Blue active icon and text.
- Soft background gradients.
- A clean iOS-inspired aesthetic.

Adapt this concept for ATLAS.

**CRITICAL CHANGE: The Home button must be in the CENTER, not on the left.**

Use five primary navigation destinations, with two destinations on either side of Home.

## Default navigation

1. Explore
2. Plans
3. Home
4. Tracker
5. Profile

Example:

    [Explore] [Plans] [HOME] [Tracker] [Profile]

Home should be:

- Exactly centered.
- More visually prominent than the other buttons.
- Slightly larger.
- Easy to reach.
- Recognizable as the primary tab.

## Implement four navigation presets

### Variant A — Balanced Glass

A wide pill-shaped translucent navigation bar.

All five destinations are arranged horizontally.

The Home item uses a soft circular highlight.

Designed for daily use.

### Variant B — Floating Island

A floating frosted-glass navigation capsule positioned above the bottom safe area.

Home is slightly raised above the navigation surface, creating a floating central button.

The design should remain tasteful and not resemble a cheap gaming HUD.

### Variant C — Minimal Glass

A smaller, more compact bar.

Subtle background blur.

Minimal labels, carefully selected iconography and almost invisible borders.

Home remains prominent but the interface uses less space.

### Variant D — Dynamic Island Inspired

A compact navigation surface with smooth expansion of the active item.

The selected destination receives an animated background.

The main Home button remains visually central.

Do not copy Apple's proprietary assets or present the implementation as an official Apple component.

## Customization

In Settings, allow users to select their preferred navigation style.

Use one shared route registry with interchangeable navigation presentations.

Switching navigation styles must never recreate or reset screen state.

## Visual effects

Support:

- Frosted glass.
- Backdrop blur.
- Semi-transparent layered surfaces.
- Soft blue accents.
- Smooth spring animations.
- Gentle icon transitions.
- Animated selection indicators.
- Haptic feedback.
- Dark and light themes.
- Respect for reduced-motion settings.

Important implementation requirements:

- Respect iOS/Android safe areas.
- Use touch targets of at least approximately 44 × 44 logical points.
- Ensure sufficient contrast.
- Provide a non-blur fallback on unsupported hardware.
- Maintain smooth scrolling and transitions.
- Do not stack excessive expensive blur layers.
- Do not allow the bar to overlap the keyboard or critical buttons incorrectly.
- Avoid platform-incompatible shadow effects.
- Test on narrow Android devices as well as iPhones.

The bottom navigation should be a replaceable design-system component, not hardcoded into individual screen implementations.

---

# 15. DESIGN SYSTEM AND VISUAL IDENTITY

The entire application should feel:

- Premium.
- Minimalistic.
- Clean.
- Modern.
- Smooth.
- Athletic.
- Carefully engineered.
- Consistent.

Think of a balance between an elegant iOS application, a professional fitness analytics product and a modern training journal.

## Suggested design tokens

Dark theme:

- Deep navy or graphite background.
- Slightly lighter elevated surfaces.
- Frosted glass cards.
- Electric blue accents.
- Subtle cool-toned borders.
- High-contrast text.

Light theme:

- Off-white or pale gray backgrounds.
- Soft blue-tinted translucent panels.
- Dark slate text.
- Minimal shadows.
- Subtle blue gradients.

Also implement accent presets:

- Blue.
- Violet.
- Emerald.
- Orange.
- Monochrome.

Centralize colors, spacing, typography, corner radii and elevation in design tokens.

Do not hardcode arbitrary colors in hundreds of components.

## Component library

Create reusable components such as:

- GlassCard.
- GlassTabBar.
- PrimaryButton.
- SecondaryButton.
- WorkoutCard.
- ExerciseCard.
- ProgramCard.
- StatCard.
- SectionHeader.
- ProgressRing.
- MuscleBadge.
- Avatar.
- Banner.
- BottomSheet.
- Modal.
- SearchBar.
- FilterChip.
- EmptyState.
- SkeletonLoader.
- TimerDisplay.
- ChartCard.

Provide standard loading, empty, error and success states.

Support responsive layouts for smaller and larger phones.

Use high-quality, consistent icons.

Avoid mixing unrelated icon packs.

---

# 16. ATHLETE PROFILE AND PERSONALIZATION

Create a rich, customizable local athlete profile.

The profile should not require online account creation.

## Header

- Profile banner.
- Circular avatar.
- Display name.
- Optional short biography.
- Training objective.
- Training experience.
- Joined date.
- Optional profile theme.

Users can upload local images for avatars and banners.

Provide attractive default gradient and illustrated banners.

Never require public profile hosting.

## Statistics

Show:

- Completed workouts.
- Total training duration.
- Total recorded workout volume.
- Active weeks.
- Personal records.
- Training streak.
- Favorite training split.
- Most frequently trained muscle groups.
- Current program.
- Program history.

## Customization

Let users:

- Choose a banner.
- Change their avatar.
- Edit their nickname.
- Choose an accent color.
- Select a theme.
- Select their navigation preset.
- Customize dashboard cards.
- Choose measurement units.
- Select language.
- Choose animations and accessibility preferences.

## Profile sharing

Optionally allow users to generate a shareable profile or workout-summary image locally.

No social platform or public account is required for this capability.

Personal health and training data must remain private by default.

---

# 17. STATISTICS AND PERFORMANCE ANALYTICS

Implement a meaningful analytics module.

Charts should be easy to understand and grounded in recorded data.

Include:

- Workout frequency over time.
- Weekly and monthly training volume.
- Individual exercise progression.
- Training duration.
- Training consistency.
- Muscle-group frequency.
- Total completed sets.
- Estimated strength progression.
- Personal record timeline.
- Program comparisons.
- Workout completion heatmap.
- Training streak history.
- Body measurements where users choose to enter them.

## Advanced analytics

Add optional views for:

- Volume by muscle group.
- Direct and estimated secondary sets.
- Weekly hard-set trends.
- Average RPE/RIR.
- Training load distribution.
- Program adherence.
- Comparison between training phases.
- Historical progression when switching programs.

Separate exact logged measurements from calculated estimates.

Explain formulas and assumptions.

Avoid presenting speculative recovery or muscle-growth scores as medically precise.

## Charts

Use attractive mobile-native charts.

They must support:

- Dark/light themes.
- Interactive time ranges.
- Touch tooltips.
- Proper number formatting.
- Empty data states.
- Accessible labels.
- Smooth rendering.

---

# 18. ACHIEVEMENTS AND OPTIONAL GAMIFICATION

Build a lightweight achievement system.

Examples:

- First Workout.
- First Custom Program.
- Ten Completed Workouts.
- Fifty Completed Workouts.
- One Hundred Workouts.
- First Personal Record.
- Consistency Milestones.
- First Exercise Library Favorite.
- Completed Training Block.
- Tried Three Training Styles.
- Six Months of Logged Training.
- First Program Transition.

Support achievement icons, progress bars and optional profile display.

Use a modular rule engine so new achievements can be defined as data without introducing unrelated changes to workout tracking.

Avoid manipulative streak mechanics.

Rest and recovery should not be treated as failure.

Do not encourage excessive training merely to unlock achievements.

---

# 19. OPTIONAL INNOVATIVE FEATURES

Design extension points for the following features, but prioritize the reliable core application first.

### 19.1 Smart Workout Assistant

An explainable recommendation system that:

- Helps select a training program.
- Suggests equipment-compatible alternatives.
- Evaluates recent training history.
- Recommends an appropriate next session.
- Helps with schedule transitions.
- Highlights possible scheduling conflicts.

Core suggestions should work locally without a paid AI API.

### 19.2 Workout Comparison

Compare two programs side by side:

- Training frequency.
- Muscle distribution.
- Goal.
- Equipment.
- Session duration.
- Difficulty.
- Recovery demands.
- Scheduling flexibility.

### 19.3 Muscle Activity Map

Visualize which muscles were recently trained.

Differentiate primary from secondary involvement.

This is an estimate derived from logged exercise metadata, not a medical assessment of recovery.

### 19.4 Training Timeline

A single timeline combining:

- Workouts.
- Personal records.
- Program switches.
- Rest days.
- Progress milestones.
- Training blocks.

### 19.5 Quick Workout Mode

Start a simple session with minimal setup.

Useful when a user does not want to follow a full program.

### 19.6 Equipment Profile

Users list equipment available at home or in their gym.

The exercise library and program finder can use this information for filtering.

### 19.7 Workout Notes and Feedback

After a session, users may record:

- Perceived difficulty.
- Energy.
- General recovery impression.
- Notes.
- Optional soreness information.

Do not use this information to make medical diagnoses.

### 19.8 Future Integration Interfaces

Prepare architectural interfaces, without making them current dependencies, for:

- Apple Health / HealthKit.
- Android Health Connect.
- Wearable devices.
- Cloud backup.
- Optional accounts.
- Optional community features.
- Licensed creator content.

---

# 20. CONTENT PACK SYSTEM

This is a critical scalability feature.

Build the program and exercise catalog around structured, versioned content packs.

Examples:

- Core Bodybuilding.
- Beginner Strength.
- Advanced Strength.
- Powerbuilding.
- Calisthenics.
- Home Training.
- Functional Fitness.
- Athlete Collections.
- Verified Exercise Media.
- Additional Languages.

Each content pack should define:

- Unique identifier.
- Version.
- Name.
- Description.
- Category.
- Included records.
- Dependencies.
- Author/source metadata.
- Licensing metadata.
- Compatibility requirements.
- Content checksums.
- Validation results.

Allow content packs to be bundled with an application release.

Future updates should support installing compatible packs through a simple user action, without manual database operations.

Support:

- Pack installation.
- Version upgrades.
- Duplicate prevention.
- Dependency validation.
- Content integrity checks.
- Optional pack removal.
- Attribution display.

Never allow content-pack updates to destroy user-created exercises or historical workout logs.

Do not require executable third-party plugins for user-supplied content packs.

Use safe, schema-validated declarative data formats.

---

# 21. LOCALIZATION

Use an extensible localization architecture.

Initial languages:

- Ukrainian.
- English.
- Russian.

Use Ukrainian as the initial default with straightforward language switching during onboarding or Settings.

Keep the architecture open for additional languages, including Japanese.

Program and exercise content should support localized names, aliases, descriptions and instructions.

If a translation is unavailable, use a sensible fallback rather than displaying missing localization keys.

Do not duplicate entire exercise records just to support translated names.

---

# 22. ONBOARDING EXPERIENCE

Keep onboarding optional and extremely fast.

Suggested first launch:

**Welcome to ATLAS**

"Your training. Your rules."

Let the user:

1. Choose a language.
2. Choose a theme.
3. Optionally select a training goal.
4. Optionally specify experience and equipment.
5. Choose an existing program or create a custom one.

Provide a visible "Skip and explore" option.

Never require:

- Registration.
- Email verification.
- Credit card.
- Cloud connection.
- Mandatory body measurements.
- Permission to access personal health data.

The product should be useful immediately.

---

# 23. FITNESS PROGRAMMING AND SAFETY QUALITY

Use established exercise science and reliable coaching sources when developing program templates and explanatory material.

Distinguish:

- Beginner guidance.
- Intermediate guidance.
- Advanced training approaches.
- Evidence-based general principles.
- Creator-specific methods.
- User-configurable preferences.

Account for:

- Progressive overload.
- Training frequency.
- Volume.
- Exercise selection.
- Recovery.
- Individual variability.
- Deloads.
- Equipment limitations.
- Skill requirements.

Do not claim that one split is universally optimal.

For CrossFit-style or technically demanding strength movements, support scalable alternatives and appropriately cautious technique information.

Provide ordinary educational information rather than personalized medical advice.

Relevant source references for research include:

- https://acsm.org/
- https://www.crossfit.com/
- https://jeffnippard.com/
- https://www.youtube.com/
- https://developers.tiktok.com/

Research and document additional credible sources as needed.

Create a source register recording what information was confirmed and when.

---

# 24. DOCUMENTATION AND DEVELOPER EXPERIENCE

Create useful project documentation.

At minimum:

- README.md — setup and project overview.
- ARCHITECTURE.md — module structure and dependencies.
- DATABASE.md — schema and migrations.
- PROGRAM_FORMAT.md — training program data specification.
- SCHEDULING.md — schedule strategies and edge cases.
- CONTENT_PACKS.md — installing and validating content.
- MEDIA_LICENSING.md — media provenance and licensing.
- LEGACY_MIGRATION.md — Daycounter import process.
- DESIGN_SYSTEM.md — tokens, components and navigation variants.
- TESTING.md — automated testing strategy.
- ROADMAP.md — progress, remaining work and milestones.

Add meaningful examples for creating:

- A new exercise.
- A new workout program.
- A new content pack.
- A new training modality.
- A new navigation preset.
- A new dashboard widget.

Document public module interfaces.

Favor simple scripts that developers can run locally.

Avoid requiring a large collection of manually configured environment variables.

---

# 25. TESTING AND RELIABILITY

Quality is more important than superficial feature count.

Write tests for core domain logic from the beginning.

## Required test areas

### Database

- Initial database creation.
- Migrations.
- Seed-data loading.
- Content-pack updates.
- Import/export round trips.
- Duplicate handling.
- Rollback behavior.

### Workout Tracker

- Completing sets.
- Editing workout data.
- Interrupted workout restoration.
- Session completion.
- Personal record calculations.
- Unit conversions.
- Historical record persistence.

### Scheduling

- Fixed schedules.
- Rolling schedules.
- Asynchronous schedules.
- Rest-day insertion.
- Keep Schedule.
- Shift Schedule.
- Program transitions.
- Smart Transition recommendations.
- Manual overrides.
- Calendar consistency.

### Program Library

- Data validity.
- Program versioning.
- Filtering.
- Duplicates.
- Source metadata.
- Exercise references.
- Template cloning.

### Navigation and UI

- All bottom navigation variants.
- Home center position.
- Dark and light themes.
- Keyboard avoidance.
- Safe-area behavior.
- Accessibility.
- Smaller screen support.
- Reduced motion.

### Legacy Migration

- Original Daycounter data preservation.
- Importing historical workouts.
- Preserving transition history.
- Idempotent repeated imports.
- Failed import recovery.

Run type checking, linting, tests and supported builds regularly.

Do not claim that an Android or iOS release build was tested unless it was actually built and verified.

---

# 26. PERFORMANCE REQUIREMENTS

The application must remain responsive with:

- Hundreds of workout programs.
- Hundreds or thousands of exercise records.
- Several years of training history.
- Large media libraries.
- Complex calendars and analytics.

Use:

- Indexed database queries.
- Efficient list virtualization.
- Local image caching.
- Lazy screen loading where appropriate.
- Memoization where it improves measured performance.
- Background-safe persistence.
- Incremental content updates.
- Lightweight, optimized animations.

Avoid loading the entire exercise media library into memory.

Avoid repeated full-database scans when rendering Home or Calendar.

Keep bundled app size reasonable.

Prioritize a responsive workout logging experience over visual effects.

---

# 27. IMPLEMENTATION PLAN

Do not attempt to implement every feature in one giant unreviewed change.

Work in milestones, maintaining a runnable application throughout development.

## PHASE 1 — Investigation and Architecture

- Inspect the workspace.
- Identify available Daycounter code and exports.
- Research a suitable technical foundation.
- Define the module boundaries.
- Define the data model.
- Establish the content-source strategy.
- Create the design-system specification.
- Establish the migration plan.
- Document architecture decisions.

**Deliverable:** A clear architecture and implementation plan, followed by the new project scaffold.

## PHASE 2 — Working Application Foundation

Implement:

- Expo/React Native project.
- App initialization.
- Local database.
- Migration runner.
- Theme system.
- Localization foundation.
- Reusable design components.
- Home screen.
- Five-tab navigation with centered Home.
- Four interchangeable navigation presets.
- Local profile.
- Settings.

**Deliverable:** A working mobile app with functional navigation and persistent local preferences.

## PHASE 3 — Exercise Library

Implement:

- Exercise database.
- Exercise seed-data importer.
- Search and filters.
- Exercise detail screens.
- Image/animation provider.
- Exercise alternatives.
- User-created exercises.
- Media attribution.
- Initial properly licensed assets.

**Deliverable:** A usable offline exercise encyclopedia.

## PHASE 4 — Workout Program Library

Implement:

- Program schemas.
- Program catalog.
- Categories.
- Filters.
- Program detail pages.
- Favorite programs.
- Start program flow.
- Program versioning.
- Program copying.
- A curated starter set of useful routines.

**Deliverable:** Users can browse, understand and activate a real training program.

## PHASE 5 — Tracking and Scheduling

Implement:

- Complete workout session tracker.
- Set and exercise logging.
- Timers.
- Local history.
- Fixed and rolling schedule strategies.
- Calendar.
- Extra Rest.
- Change Day.
- Smart Transition.
- Program transitions.
- Interrupted-session recovery.

**Deliverable:** Users can follow and track a program over time.

## PHASE 6 — Custom Program Builder

Implement:

- Complete program editing.
- Custom scheduling.
- Exercise selection.
- Drag and drop.
- Supersets/circuits.
- Custom exercise parameters.
- Program duplication.
- Versioning and editing safeguards.

**Deliverable:** Users can create personalized training programs without code.

## PHASE 7 — Analytics and Profile

Implement:

- Exercise progression graphs.
- Training history charts.
- Personal records.
- Muscle statistics.
- Calendar heatmap.
- Achievements.
- Profile personalization.
- Banners.
- Custom dashboard widgets.

**Deliverable:** A complete personal training dashboard and history.

## PHASE 8 — Content Expansion and Migration

Implement:

- Content-pack management.
- Improved exercise-media coverage.
- Verified creator catalogs.
- Additional specialized programs.
- Legacy Daycounter importer.
- Import/export improvements.
- Source verification reporting.

**Deliverable:** A scalable program ecosystem with preserved legacy history.

## PHASE 9 — Quality and Release Preparation

- Complete regression testing.
- Mobile performance review.
- Accessibility review.
- Verify offline behavior.
- Review content licenses.
- Verify migrations.
- Produce Android development and release builds where tooling permits.
- Prepare iOS build configuration and test on a supported environment.
- Write setup and distribution instructions.
- Document known limitations.

**Deliverable:** A stable, installable application candidate rather than a visual prototype.

---

# 28. WORKING RULES FOR CODEX

Follow these rules throughout the project:

1. This is a new repository/project, not a rewrite of the existing Daycounter directory.

2. Preserve backward compatibility with imported training history.

3. Prefer clean, modular solutions over quick fixes.

4. Do not introduce fake buttons, nonfunctional settings or hardcoded mock statistics into features represented as complete.

5. If a feature is not implemented, label it clearly in the development environment and roadmap.

6. Never fabricate workout source verification, creator endorsements or licensing permissions.

7. Do not use unverified copyrighted video or image assets.

8. Keep the application runnable after each milestone.

9. Implement meaningful automated tests alongside domain logic.

10. Avoid changing unrelated modules when working on a single feature.

11. Use structured seed data rather than hardcoded programs inside components.

12. Provide clear status updates about implemented features and remaining work.

13. Explain architectural decisions where multiple approaches are reasonable.

14. Prioritize core workflow quality: discovering a program, activating it, completing a workout and viewing history.

15. Do not force users to create accounts or use cloud services.

16. Avoid unnecessary subscription or payment infrastructure.

17. Store user data locally by default.

18. Make content import/export and local backups reliable.

19. Ensure code and app naming can be changed centrally later.

20. Do not stop at writing a proposal: after initial investigation, implement the project incrementally.

---

# 29. ACCEPTANCE CRITERIA

The core implementation is successful when a new user can:

1. Install and open ATLAS without registering.
2. Browse a meaningful offline program library.
3. Search for exercises and view instructions.
4. Choose an existing split.
5. Activate the split and see a correct schedule.
6. Start today's workout.
7. Log sets, reps and weights.
8. Close and reopen the app without losing progress.
9. Complete the workout.
10. View the result in training history.
11. See basic progress statistics.
12. Insert an extra rest day.
13. Change a workout day.
14. Switch to another program.
15. Receive an explainable starting-day recommendation.
16. Retain all previous workout history.
17. Create and edit a custom program.
18. Personalize their profile and interface.
19. Switch between the four bottom navigation designs.
20. Export their personal training data.
21. Use the core application without internet access.

Additionally:

- All navigation destinations must be functional.
- The center tab must always be Home.
- Workout schedules must be deterministic.
- Source-attributed routines must not contain invented claims.
- The exercise database must be extensible.
- The modular architecture must permit changes without broad rewrites.

---

# 30. START NOW

First, inspect the available project workspace and identify any accessible Daycounter code or exported data.

Then:

1. Summarize the existing resources that can actually be reused.
2. Present the proposed new application architecture.
3. List dependencies and important technical choices.
4. Identify any blockers, including inaccessible legacy data or missing media licenses.
5. Create the new project structure.
6. Implement PHASE 1 and PHASE 2.
7. Run available checks and confirm that the new application starts successfully.
8. Continue through subsequent phases incrementally.

For each milestone, report:

- What was implemented.
- Which files/modules changed.
- Which tests ran and their results.
- What remains incomplete.
- Which external assets or source records still require verification.
- What the next development milestone is.

Do not claim unsupported features are complete.

**Final product principle: ATLAS should be easy for athletes to use, easy for developers to maintain, and easy for the product owner to evolve. Build it as a real mobile fitness application, not a collection of disconnected demonstration screens.**