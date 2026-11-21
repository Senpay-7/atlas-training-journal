# Content packs

Current content is a bundled starter collection validated with Zod and reference tests. A general pack installer/updater is not yet implemented.

The next pack manifest must contain id, semantic version, app schema compatibility, dependencies, record list, author, text license, separate media licenses, attribution, checksums, verification date and source URLs. Import steps: parse, validate, resolve IDs, verify checksums and permissions, show preview, create recovery copy, install transactionally, report counts.

Use stable namespaced exercise IDs and explicit version migration rules. A pack update must not overwrite user-owned content or historical snapshots. Removing a pack must preserve history and report active-program dependencies. Never accept executable scripts in packs.

To add one starter exercise now, add a localized original record in `starter.ts`; to add a program, reference only validated exercise IDs, define a cycle and run tests. To add third-party material, complete the rights review before bundling any text/media. See MEDIA_LICENSING.md.
