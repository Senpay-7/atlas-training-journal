# ATLAS — Additional Features: Profile Banners, RPG Progression, Gamification & Customization

## IMPORTANT: SUPPLEMENT TO THE MAIN PROJECT SPECIFICATION

This document extends the original ATLAS development specification.

Do not replace, restart, or unnecessarily rewrite the existing implementation. Integrate these additional requirements into the modular architecture already defined.

The primary additions are:

1. A customizable profile banner system.
2. An RPG-style leveling and experience system inspired by Solo Leveling.
3. A personal character progression interface.
4. Improved animations, visual feedback and transitions.
5. Complete customization of existing and user-created workouts.
6. An extensible gamification foundation for future features.

The application must remain offline-first, lightweight, mobile-friendly and usable without registration.

---

# 1. PROFILE BANNER SYSTEM

Implement a customizable profile banner system based on the following behavior from an earlier project.

The original implementation was designed for a Next.js website, but ATLAS is a mobile application built with React Native and Expo.

**Recreate the functionality, not the website-specific implementation.**

Do not introduce Next.js, Prisma, CSS canvas components, browser Pointer Events or web server actions into the mobile application solely for this feature.

Use equivalent native mobile technologies.

## 1.1 Profile Header Layout

Create a ProfileHeader component.

The top section should contain two visually connected cards:

- Left: a square avatar card.
- Right: a rectangular profile banner.
- Small spacing between the cards.
- Matching rounded corners.
- Consistent visual styling.

Avatar size:

- Approximately 128 × 128 on small layouts.
- Up to approximately 176 × 176 on larger layouts.

Banner:

- Aspect ratio: exactly 3:1.
- Maximum height: approximately 280 logical pixels where space allows.
- Rounded corners.
- Cover-style image rendering.
- No image distortion.
- Correct cropping on different screen sizes.

On very narrow screens, adapt the layout without forcing horizontal overflow or making the banner unusably small. Preserve the avatar, banner and 3:1 aspect ratio.

Below the hero section, show:

1. Display Name.
2. @username or local profile handle.
3. Date joined.
4. Biography.
5. Profile actions.

All identity elements should be centered.

## 1.2 Profile Actions

Add a three-dot menu that smoothly reveals:

- Edit Banner.
- Edit Profile.
- Remove Banner.
- Settings.

The Remove Banner action should use the theme's destructive/error color.

Use native animated expansion and collapsing.

Ensure shadows, button outlines and animations are not accidentally clipped.

Add a small camera icon to the avatar card. Tapping it opens the Avatar Picker.

## 1.3 Banner Types

Support three main banner types:

**Default Gradient**

When the user has not selected a banner, display an automatically generated theme-specific gradient.

Light theme:

linear-gradient(135deg, #e8edf5, #d4dce8)

Dark theme:

linear-gradient(135deg, #1a1c2e, #0f1019)

These values describe gradient stops and direction. Implement them using a native gradient component rather than browser CSS.

**Gradient Preset**

Provide ten visually distinct gradient presets.

Store the selected preset as a stable identifier or structured gradient definition, not as arbitrary executable CSS.

**Custom Image**

Allow the user to select an image from their device and use it as their profile banner.

Save the processed image locally within the application's persistent storage.

Do not require uploading it to a remote server.

Legacy values such as gradient-prefixed strings, local web paths or HTTPS image URLs may be supported by a dedicated import adapter, but they must not dictate the native storage architecture.

## 1.4 Banner Editor

Create a BannerEditorModal.

It should include:

- A grid of ten gradient presets.
- Image selection from the device gallery.
- An image cropping interface.
- Pinch-to-zoom support.
- Drag-to-position support.
- Preview before saving.
- Reset and Cancel controls.
- Save button.

Implement a reusable ImageTransformEditor component.

Requirements:

- Support touch gestures.
- Support pinch zoom.
- Support drag/pan.
- Minimum zoom: 1×.
- Maximum zoom: 4×.
- Keep the selected image covering the crop rectangle.
- Prevent empty areas from appearing inside the crop.
- Preserve the exact image position visible in the preview.

## 1.5 Image Processing

The banner must consistently use a **3:1 ratio**.

Preferred exported resolution:

1920 × 640 pixels.

Preferred format:

WebP with approximately 0.92 encoding quality.

Use Expo-compatible native image-processing tools.

If a device or library cannot perform the preferred transformation, provide a reliable fallback without distorting the image.

The preview and exported result must match.

The user should never see an unexpected crop after saving.

## 1.6 Persistent Storage

Store:

- Selected banner type.
- Gradient preset or gradient definition.
- Local image URI.
- Optional image metadata.
- Last update timestamp.

Use the existing local database and file-storage system.

When deleting a banner:

- Restore the default theme-specific gradient.
- Update the profile immediately.
- Safely remove unreferenced locally managed banner files.

Banner customization must work fully offline.

## 1.7 Additional Customization

Optionally add:

- Banner dimming.
- Banner border styles.
- Simple frame variations.
- Profile accent colors.
- Achievement-themed banner presets.
- Unlockable gradient or frame styles.

Keep these features cosmetic.

Do not make the banner editor unnecessarily complicated.

---

# 2. RPG-STYLE PLAYER PROGRESSION

Introduce a new module called:

**Player Progression System**

The concept is inspired by the progression fantasy of Solo Leveling.

Users should feel that their real-world workouts contribute to the development of a personal in-app character.

However, do not copy copyrighted Solo Leveling character models, artwork, animations, interfaces, logos, music, names or proprietary game assets.

Create an original ATLAS visual identity.

The system should provide an enjoyable sense of character progression without requiring an actual 3D video game.

## 2.1 Player Levels

Every user has a progression level.

Example:

Level 1 — Beginner

Level 5 — Trainee

Level 10 — Challenger

Level 20 — Warrior

Level 35 — Elite

Level 50 — Master

Level 75 — Legend

Level 100 — Ascendant

These names are examples and should be configurable.

The user receives experience points (XP) through meaningful training activities.

Display:

- Current level.
- Current XP.
- XP needed for the next level.
- Animated XP progress bar.
- Current title or rank.
- Total completed workouts.
- Recent progression events.

## 2.2 XP Rewards

Implement a configurable reward system.

Example initial reward configuration:

| Activity | XP |
|---|---:|
| Complete a workout | +100 |
| Complete a planned exercise | +10 |
| Achieve a verified personal record | +25 |
| Finish a complete training block | +250 |
| Complete an initial program milestone | +150 |

These are initial game-balance values, not fixed requirements.

Rewards must be awarded only when the associated activity meets its completion rules.

Do not award XP merely for opening the app, switching workout tabs or creating hundreds of empty exercise entries.

Prevent duplicated rewards when users edit or import existing training records.

Use unique reward-event identifiers.

## 2.3 XP Progression Formula

Use a progression curve where later levels require more experience.

For example:

XP required to progress from level L to level L+1:

XP = round(100 × L^1.35)

This is a proposed starting formula.

Keep it configurable and test the progression balance.

The level engine must:

- Calculate rewards deterministically.
- Support multiple level-ups from one reward.
- Preserve lifetime XP.
- Persist reward events.
- Avoid duplicate rewards.
- Handle corrections when workout records are edited.
- Preserve progression when changing workout programs.
- Support future balancing updates without corrupting existing progress.

Do not recalculate old rewards using new rules unless an explicit migration requires it.

## 2.4 Daily Training Rewards

Make completing a planned workout feel rewarding.

Example interaction:

1. User completes the last set.
2. The app displays a workout completion animation.
3. The session summary appears.
4. The user earns XP.
5. The XP bar fills smoothly.
6. A level-up animation appears if the next level is reached.
7. New achievements or cosmetics appear when applicable.

The user should feel a tangible sense of accomplishment.

Avoid overwhelming animations after every minor action.

Allow reducing or disabling visual effects.

## 2.5 Preventing XP Exploits

The system should not reward users for repeatedly creating meaningless records.

Implement:

- Unique session reward identities.
- Duplicate-event detection.
- Validation of workout completion.
- Configurable reward caps where appropriate.
- No XP for simply adding an exercise to a program.
- Appropriate handling of deleted or corrected workout data.

Longer workouts should not automatically generate unlimited XP.

Favor consistency and meaningful progression rather than excessive training volume.

Rest days must not cause penalties, level reductions or unhealthy pressure to train.

---

# 3. PLAYER PROFILE AND CHARACTER SCREEN

Create an additional profile section called:

**My Character**

It should feel like a personal RPG dashboard.

Show:

- Character/avatar image.
- Player level.
- Rank/title.
- XP progress.
- Completed quests.
- Achievements.
- Training activity.
- Personal milestones.
- Unlockable cosmetics.

## 3.1 Character Representation

For the initial version, use:

- A customizable 2D avatar.
- Different avatar backgrounds.
- Unlockable frames.
- Simple rank effects.
- Level-specific visual accents.

Avoid attempting a complex 3D character creator in the first implementation.

Prepare the architecture for a future character renderer.

It should eventually be possible to add animated character models without rewriting workout tracking or the XP system.

## 3.2 RPG Character Attributes

Optionally represent training history through abstract, game-like attributes:

- Strength.
- Endurance.
- Consistency.
- Discipline.
- Versatility.

These should be based on recorded activities and clearly defined calculations.

For example:

- Strength relates to tracked strength-performance trends.
- Endurance relates to supported endurance activities.
- Consistency relates to workout adherence over time.
- Versatility reflects different training categories.

Do not present these values as precise physiological measurements.

The RPG attributes are motivational statistics.

Actual weights, repetitions, records and training volume remain the source of truth for athletic progress.

## 3.3 Rankings and Titles

Include optional local rank progression.

Examples:

E Rank → D Rank → C Rank → B Rank → A Rank → S Rank

Alternatively, support an original ATLAS rank naming system.

Do not directly copy Solo Leveling's interface designs or present this system as an official adaptation.

Rank progression may depend on cumulative XP and achievements.

Rank transitions should have distinctive animations.

---

# 4. QUEST AND CHALLENGE SYSTEM

Introduce a module called:

**Training Quests**

This system adds goals to normal workout activity.

Quests should use real workout data.

## 4.1 Quest Categories

Support:

- Daily quests.
- Weekly quests.
- Personal challenges.
- Long-term achievements.
- Program milestones.
- Optional special events in future versions.

## 4.2 Examples

Daily Quest:

"Complete your planned workout."

Weekly Quest:

"Complete 3 planned training sessions this week."

Personal Challenge:

"Reach a new bench press personal record."

Program Milestone:

"Complete the first 4 weeks of your current training program."

The quest system must automatically update progress based on legitimate recorded events.

## 4.3 Custom Quests

Allow users to create their own challenges.

They should be able to configure:

- Quest name.
- Description.
- Activity type.
- Goal.
- Deadline, if desired.
- Reward setting where permitted.
- Repeat behavior.

Self-created quests should use reasonable reward limits so they cannot instantly generate unlimited progression.

## 4.4 Future Boss System

Prepare the architecture for a future feature in which completed workouts contribute to the progress of a virtual challenge or boss encounter.

Do not implement a complex combat system yet.

Potential future example:

A boss has a progression bar.

Completing a valid workout contributes progress toward defeating the boss.

Different exercises may provide different visual effects without encouraging unsafe extra repetitions.

For now, create only a clean extension interface for future challenge visualization.

**Prioritize the functional leveling, quest and achievement systems over game combat.**

---

# 5. COMPLETE WORKOUT CUSTOMIZATION

One of the most important requirements is that every training program must be customizable.

This includes:

- Built-in programs.
- Athlete-associated programs.
- Imported programs.
- User-created programs.
- Programs currently in progress.

Users must never be locked into fixed exercise lists.

## 5.1 Editing Existing Programs

Provide a visible:

**Customize Program**

action.

When editing a bundled or sourced program, create a personal editable copy or override layer.

Preserve the original program definition.

Clearly indicate that the user is training with a personalized version.

Example:

Original:

Push / Pull / Legs

Customized:

My Push / Pull / Legs

The original should remain available for comparison or restoration.

## 5.2 Supported Changes

Users must be able to:

- Rename any personal program.
- Add training days.
- Delete training days.
- Reorder training days.
- Change muscle-group combinations.
- Add exercises.
- Remove exercises.
- Replace exercises.
- Reorder exercises.
- Change sets.
- Change repetitions.
- Change weight targets.
- Change rest periods.
- Change exercise notes.
- Add supersets.
- Configure training-day frequency.
- Add rest days.
- Change the program cycle.
- Save different program versions.

The user should also be able to create a completely custom split from zero.

## 5.3 Quick Editing During a Workout

While tracking a live session, allow:

- Add Exercise.
- Replace Exercise.
- Remove Exercise.
- Add Set.
- Delete Set.
- Modify Weight.
- Modify Repetitions.
- Modify Rest Timer.
- Change Exercise Order.

Use simple interactions, contextual menus and drag-and-drop where supported.

Avoid requiring users to enter a full program editor just to replace one unavailable machine or exercise.

## 5.4 Template vs Current Session

Provide a clear distinction between:

**Edit This Workout Only**

Changes apply to the active session.

**Update My Program**

Changes are saved into the user's personalized program for future sessions.

This distinction is important.

Never unexpectedly modify future workouts when the user only intended to adjust today's session.

## 5.5 Historical Data

Changing a program must not modify previously recorded workouts.

Completed sessions should retain their historical exercise names, weights, repetitions and program version information.

Implement snapshot/version-based behavior as appropriate.

---

# 6. PREMIUM ANIMATION SYSTEM

ATLAS should have an original, polished animation identity.

Animations should feel fluid and satisfying, particularly during:

- Opening the app.
- Switching navigation tabs.
- Entering the profile.
- Expanding settings.
- Selecting workout programs.
- Completing sets.
- Completing workouts.
- Earning XP.
- Leveling up.
- Unlocking achievements.
- Completing quests.
- Switching between profile and character views.

Use animations to communicate state changes, not merely as decoration.

## 6.1 Preferred Libraries

Evaluate maintained, Expo-compatible options such as:

- React Native Reanimated.
- React Native Gesture Handler.
- Lottie for authored vector animations.
- Rive for advanced interactive state-machine animations.
- Expo Haptics for tactile feedback.
- Expo Linear Gradient and a compatible blur solution for layered glass effects.

Check current compatibility, package licenses, runtime requirements and whether development builds are needed.

Use the simplest suitable tool for each animation.

Avoid installing multiple heavy animation libraries without a clear technical reason.

## 6.2 Level-Up Animation

Create a distinctive ATLAS level-up experience.

Example sequence:

1. Workout completion panel appears.
2. XP progress animates.
3. XP reaches the required threshold.
4. A subtle glow forms around the level indicator.
5. The numeric level transitions upward.
6. A short particle or light effect appears.
7. The new level is displayed.
8. The interface smoothly returns to the workout summary.

Use an original dark fantasy / futuristic training aesthetic.

Avoid excessive flashing, long unskippable animations and performance-heavy full-screen effects.

## 6.3 Completion Animation

After completing a workout:

- Display a clean completion transition.
- Animate summary statistics.
- Show XP earned.
- Highlight new personal records.
- Show unlocked achievements if present.
- Provide a clear Done button.

The animation should be skippable.

Respect reduced-motion accessibility settings.

## 6.4 Navigation Animations

Improve the previously specified bottom navigation.

Provide:

- Smooth active-tab transitions.
- Animated selected-button background.
- Subtle icon scaling.
- Spring-based movement where appropriate.
- Gentle background blur transitions.
- Optional haptic feedback.

Keep the centered Home button as the primary navigation element.

Do not sacrifice responsiveness for animation complexity.

## 6.5 Animation Architecture

Use reusable primitives:

- XPProgressBar.
- LevelUpOverlay.
- AchievementUnlock.
- QuestCompletionToast.
- AnimatedGlassCard.
- AnimatedTabIndicator.
- WorkoutCompletionPanel.
- AnimatedNumber.
- RankTransition.

Centralize timing, spring configurations and reduced-motion behavior.

Animations must not contain critical application business logic.

The database must record the completed action before its visual reward animation is played.

---

# 7. VISUAL STYLE: MODERN FITNESS × ORIGINAL RPG AESTHETIC

Extend the existing ATLAS glassmorphism design system.

The primary interface should remain:

- Modern.
- Minimal.
- Premium.
- Highly readable.
- Blue-accented.
- Mobile-first.
- Inspired by contemporary iOS glass interfaces.

The RPG components can introduce:

- Subtle glowing borders.
- Dark futuristic panels.
- Animated XP bars.
- Rank emblems.
- Floating achievement notifications.
- Elegant progression screens.
- Soft particle effects.

Do not make the entire application look like a video game menu.

Users should still be able to log a workout quickly and comfortably.

## Visual Theme Presets

Support optional visual themes:

1. ATLAS Classic — clean blue glass.
2. Midnight — dark navy and subtle highlights.
3. RPG System — darker panels, glowing progression elements and rank effects.
4. Minimal — reduced effects and simplified cards.

Themes must be applied through the shared design system.

Profile banners, navigation, cards and progression indicators should adapt coherently.

---

# 8. NEW MODULAR COMPONENTS

Integrate the features as additional independent modules.

Suggested structure:

    features/
      profile/
        components/
          ProfileHeader
          ProfileBanner
          BannerEditorModal
          AvatarPickerModal
        services/
          banner-storage
          banner-transform
      progression/
        domain/
          xp-engine
          level-calculator
          reward-rules
        components/
          XPProgressBar
          LevelUpOverlay
          PlayerLevelCard
          RankBadge
      character/
        components/
          CharacterScreen
          CharacterAvatar
          CharacterStats
      quests/
        domain/
          quest-rules
          quest-progress
        components/
          QuestCard
          QuestProgress
          QuestCompletionToast
      workout-customization/
        components/
          QuickExerciseEditor
          ProgramCustomization
        services/
          program-versioning
      animations/
        components/
        presets/
        hooks/

These are conceptual module boundaries; adapt them to the actual project structure and naming conventions.

Do not create unnecessary duplicate modules when an existing feature already owns the relevant responsibility.

The progression engine should consume validated workout-completion events through well-defined interfaces.

It must not directly depend on visual screen components.

---

# 9. STORAGE AND RELIABILITY

Extend the existing SQLite data model to support:

- ProfileBanner
- PlayerProgression
- XPEvent
- LevelHistory
- PlayerRank
- QuestDefinition
- QuestProgress
- QuestCompletion
- CosmeticUnlock
- UserCosmeticPreference

Use migrations.

Do not replace the existing database or reset user data.

Store XP events as an auditable record of why progression was awarded.

Prevent repeated events from granting duplicate XP.

Ensure that both XP progression and quest progress survive:

- Application restarts.
- Offline sessions.
- Program changes.
- Workout edits.
- App updates.
- Data imports.

Include progression and custom profile media metadata in user backup/export.

Support safe restoration without duplicating progression rewards.

---

# 10. IMPLEMENTATION PRIORITIES

Do not implement all features simultaneously.

### Priority 1 — Profile Banner System

Implement:

- ProfileHeader.
- Theme-aware default gradients.
- Ten gradient presets.
- Local banner upload.
- Native crop editor.
- Persistent local storage.
- Banner editing/removal.

### Priority 2 — XP and Level Engine

Implement:

- XP rules.
- Reward events.
- Level calculation.
- Level progression storage.
- XP bar.
- Workout completion rewards.
- Level-up animation.

### Priority 3 — Workout Customization

Verify or implement:

- Editing existing program copies.
- Adding/removing exercises.
- Replacing exercises.
- Changing sets/reps.
- Editing today's workout only.
- Saving permanent program updates.
- Preserving historical records.

### Priority 4 — Character and Quest Screens

Implement:

- My Character.
- Rank/title display.
- Daily and weekly quests.
- Quest tracking.
- Achievements.
- Optional cosmetics.

### Priority 5 — Advanced Visual Polish

Implement:

- Improved transitions.
- Optional Rive/Lottie animations.
- RPG visual theme.
- Haptic feedback.
- More advanced progression effects.

Future boss challenges and elaborate character animations should remain optional extensions, not blockers for the initial release.

---

# 11. ACCEPTANCE CRITERIA

These additional features are successful when:

1. The user can select one of ten banner gradients.
2. The user can import and crop an image to exactly 3:1.
3. The banner retains its intended crop after saving.
4. The image remains sharp at high screen densities.
5. Default banners automatically adapt to the active theme.
6. Profile customization works offline.
7. The user can complete a workout and earn XP.
8. XP persists after restarting the application.
9. The user can level up and see an animated progression event.
10. Duplicate workout-completion events cannot repeatedly award XP.
11. The user can see a personal character/progression page.
12. Quests track legitimate workout completion.
13. The user can modify an existing program without damaging the original.
14. Exercises, sets, repetitions and training days are fully editable.
15. Completed workout history remains unchanged after editing a program.
16. Animations are smooth, optional where appropriate and accessible.
17. None of the additions requires registration or internet access.
18. The new systems remain independent, modular and testable.

## FINAL INSTRUCTION

Treat this document as an extension to the original ATLAS specification.

First inspect what has already been implemented and identify which components can be reused.

Then integrate these features incrementally, without duplicating existing systems or changing unrelated architecture.

Prioritize functional reliability, local persistence, customization and a polished mobile user experience.

**The ultimate goal is to make ATLAS feel like a combination of a serious personal workout tracker and a rewarding RPG progression system — where the user improves their real-world fitness and sees that effort reflected in an evolving digital character.**