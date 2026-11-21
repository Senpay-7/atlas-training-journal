# Design system

The user-requested second palette uses deep navy surfaces (#0A1220 / #111E32), blue actions (#234C88) and readable pale-blue details (#9DBBEE). Light mode uses cool off-white backgrounds with dark navy text/actions. The Home hero is navy in both themes, with a contrasting pale action. The calendar, upcoming workout, XP and history retain their established compositions. `theme.ts` owns color, spacing, radius and motion tokens; `ui.tsx` owns shared controls. User-selected profile banner presets retain their stable IDs and colors.

Navigation registry order is always Explore / Plans / Home / Tracker / Profile. Balanced, Floating, Minimal and Dynamic are interchangeable presentations of the same routes and do not key/remount the navigator. The active background now slides between measured tab positions in 200 ms. Home retains a larger central icon. The surface is translucent; actual platform blur, advanced shape transitions and haptics remain pending.

Ten gradients use persistent integer IDs and render at 3:1. The mobile profile uses a stacked banner/avatar layout to avoid a narrow unusable banner. Initials provide an offline avatar. Image selection/cropping and large-screen side-by-side avatar layout are pending.

`MotionPressable` uses a 120 ms press scale to 0.975 and a restrained spring return; disabled opacity changes over 200 ms. `Reveal` uses a 280 ms, 6-point transition when Home's workout state changes. Progress and modal transitions also honor both the app preference and system reduced motion. These are implementation timings, not measured device frame-rate guarantees. Touch controls have at least 44 logical pixels. Portrait phones are primary; content is bounded for desktop preview.

The original `AtlasMark` is drawn using native views. Home, Explore, exercise details, Tracker, the builder picker and program previews use 16 bundled exercise illustrations (360 KiB total). These are static illustrations, not instructional animations. `ExerciseImage` is the shared renderer and uses an explicit equipment fallback when media is absent or fails. The Home strip opens the same exercise details used by Explore and Tracker. Artwork credits are visible in details and Profile sources; immutable source URLs, SHA-256 and attribution are recorded in `licenses/exercise-media.json`. No runtime remote image requests or new dependencies were added. Coverage is tracked in `EXERCISE_MEDIA_COVERAGE.csv`.

Home presents only real records/schedule data. Duration is explicitly an estimate using 3 seconds per repetition, prescribed between-set rest and 90 seconds between exercises. It excludes unrecorded warm-up/individual pauses and is never stored as actual workout duration. The greeting uses device-local time; the seven-day activity strip is Monday-based.

On 12 October the user authorized changing green to dark blue and adding exercise imagery. This extends the approved scope to shared illustration integration in existing surfaces; it does not claim or authorize the entire remaining visual-overhaul specification.

Add a navigation preset through preferences schema + TabBar presentation, not a separate navigation tree. Add a reusable component here when shared by real features; avoid empty placeholder APIs. Widget registry, configurable accents, richer character art and authored level-up effects are planned.
