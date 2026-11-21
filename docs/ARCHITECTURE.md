# Architecture · milestone 0.1

`app` only maps Expo Router routes to feature entry points. Features use `core/store` for commands and read snapshots. They do not import another feature's implementation.

| Module / public entry | Owns |
|---|---|
| `domain/models.ts` | Zod contracts, localized content, versioned snapshots |
| `domain/programBuilder.ts` | Editable drafts, validation, version-safe program output, replacement candidates |
| `domain/homeSummary.ts` | Current-week date range and clearly labelled workout-duration estimate |
| `domain/scheduling.ts` | Calendar arithmetic and the single deterministic resolver |
| `domain/progression.ts` | XP reward policy and level calculation |
| `data/repository.ts` · AtlasRepository | Persistence commands and transactional boundaries |
| `data/database.ts` · Database | Typed SQLite port and migration runner |
| `core/store.ts` · useAtlas/bootstrap | Initialization, refreshed read model, action errors |
| `features/*/*Screen.tsx` | Feature presentation, local drafts, user interactions |
| `features/program-builder/index.ts` | Public builder/preview entry used by the program library |
| `design-system` | Theme tokens, buttons, cards, modal, animated progress, navigation |
| `content` | Validated starter definitions and dated source register |
| `services/backup.ts` | Portable backup validation, preview and relationship checks |
| `services/files.ts` | Native file picker/share and browser download adapter |

Choices: Expo 57.0.27 (npm stable on verification), React Native 0.86.3, React 19.2.3, TypeScript 6.0.3, Expo Router, Expo SQLite, Zustand, Zod and Reanimated. Expo Doctor resolves the supported versions; lockfile is authoritative. [Expo SDK 57 release notes](https://expo.dev/changelog/sdk-57).

SQLite is accessed through a small typed repository port rather than an ORM in this milestone: transactions and constraints are explicit, and tests use the same repository with real Node SQLite. JSON columns hold validated immutable nested snapshots; indexed columns hold identity, lifecycle and dates. This is an initial schema, not the final normalized catalog design.

No account system, cloud dependency, query-cache library, AI service, website wrapper or paid API. React Native Web is a supplementary preview of the native components. A future sync provider belongs behind repository contracts and must not become a core runtime dependency.

Current limits: synchronous queries and whole-state refresh are appropriate only to this small starting catalog. Replace with asynchronous paginated repositories before large media packs or multi-year history load tests. The SQLite web result buffer is limited upstream; do not claim large-data web readiness.

Extensions: new training modalities need a discriminated prescription/score schema and a tracker renderer; they should reuse session identity, source metadata and completion persistence. Content packs must be declarative, not executable plugins. Optional widget and challenge registries remain roadmap items.
