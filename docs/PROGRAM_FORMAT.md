# Program format

See executable schemas in `src/domain/models.ts` and actual examples in `src/content/starter.ts`.

```ts
{
  id: 'full-body-2', version: 1, owner: 'catalog',
  name: { en: 'Foundation', uk: 'Основа', ru: 'Основа' },
  days: [{ id: 'a', name: { en: 'A', uk: 'A', ru: 'A' },
    exercises: [{ exerciseId: 'goblet-squat', sets: 2, reps: 10, restSeconds: 90 }] }],
  cycle: ['a', null, null, 'a', null, null, null]
  // Also supply localized description, category and source metadata.
}
```

`null` is an explicit rest position, not a fake workout. Day IDs must resolve and be unique. Prescriptions support sets/reps/rest in seconds, optional target weight in kilograms and optional notes (up to 500 characters), separately from logged set values. Repeated cycle references to the same day are valid; duplicate exercises inside one day are currently disallowed because set identity uses exercise ID.

A personal copy receives a fresh ID and parentId on save; cancelling its editor does not create an orphan copy. Saving an existing personal program increments its version and rejects a stale input version. Existing activations and sessions retain their snapshots. Activate the new version to use it going forward.

The builder preserves unchanged translations, but personal names edited by the user use the entered text in all languages. New programs use category `custom` and source rights `user-created`. This version imports backups 1, 2 and 3, and exports version 3 with navy/white/black theme preferences. Older apps reject the new format. There is no local SQL schema change for these additive JSON fields. Active-session target edits are stored in the session snapshot; activated program snapshots and completed history remain unchanged.

Deleting a workout definition converts every occurrence in its cycle to recovery without shifting later dates. The editor validates that each defined workout is scheduled at least once. A cycle has 1–56 positions. Reordering workout definitions changes the list only; the Schedule step controls calendar order. Exercise replacement preserves targets and notes and asks the user to review them for the new movement.

Before importing sourced content, separately evaluate `source.classification` and `source.rights`. A verified program with reference-only rights must never be published as an executable bundled routine.

Planned: ranges, RIR/RPE, seconds/distance/calorie goals, AMRAP/EMOM/For Time blocks, circuits, supersets and multi-phase progression. These are not encoded as misleading strength sets in the initial schema.
