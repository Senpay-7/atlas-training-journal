// One-time, explicit import of selected CC BY-SA illustrations. Never runs at app startup.
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const revision = 'aac599224bb9780305239607ef98540b7e0ce389';
const root = `https://raw.githubusercontent.com/bryllim/workout-guide/${revision}`;
const selected = {
  'goblet-squat': 'goblet-squat', squat: 'squat', bench: 'bench-press',
  'db-press': 'dumbbell-bench-press', row: 'one-arm-dumbbell-row', pulldown: 'lat-pulldown',
  rdl: 'dumbbell-romanian-deadlift', ohp: 'standing-dumbbell-press', lateral: 'lateral-raise',
  curl: 'bicep-curl', pushdown: 'tricep-pushdown', 'leg-curl': 'leg-curl',
  calf: 'calf-raise', pushup: 'push-up', bridge: 'glute-bridge', deadbug: 'dead-bug',
};
async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}
const manifest = JSON.parse((await download(`${root}/packages/workout-guide/manifest.json`)).toString());
await mkdir('assets/exercises', { recursive: true });
await mkdir('docs/licenses', { recursive: true });
const records = [];
for (const [exerciseId, slug] of Object.entries(selected)) {
  const entry = manifest.find(item => item.slug === slug);
  if (!entry || entry.attribution.license !== 'CC BY-SA 4.0') throw new Error(`Missing licensed entry: ${slug}`);
  const frames = [];
  for (const frame of entry.frames.slice(0, 1)) {
    const sourcePath = frame.path.replace(/\.svg$/, '.png');
    const url = `${root}/packages/workout-guide/${sourcePath}`;
    const bytes = await download(url);
    if (bytes.readUInt32BE(0) !== 0x89504e47) throw new Error(`Not a PNG: ${url}`);
    const path = `assets/exercises/${exerciseId}-${frame.index}.png`;
    await writeFile(path, bytes);
    frames.push({ index: frame.index, path, url, sha256: createHash('sha256').update(bytes).digest('hex'), attribution: frame.attribution });
  }
  records.push({ exerciseId, slug, title: entry.name, equipment: entry.equipment, revision, checkedOn: '2026-10-12', changes: 'None. PNG files copied byte-for-byte; scaled to fit at display time.', attribution: entry.attribution, frames });
  console.log(`${exerciseId}: ${frames.length} frames`);
}
await writeFile('docs/licenses/exercise-media.json', JSON.stringify(records, null, 2) + '\n');
for (const [remote, local] of [['LICENSES.md', 'workout-guide-LICENSES.md'], ['ATTRIBUTION.md', 'workout-guide-ATTRIBUTION.md'], ['LICENSE-ASSETS', 'CC-BY-SA-4.0.txt']]) {
  await writeFile(`docs/licenses/${local}`, await download(`${root}/${remote}`));
}
const rows = records.map(record => `  '${record.exerciseId}': { slug: '${record.slug}', frames: [${record.frames.map(frame => `require('../../${frame.path}')`).join(', ')}] },`).join('\n');
await writeFile('src/content/exerciseMedia.ts', `import type { ImageSourcePropType } from 'react-native';\n\n// Attribution and immutable upstream URLs: docs/licenses/exercise-media.json.\nexport const exerciseMedia: Record<string, { slug: string; frames: ImageSourcePropType[] }> = {\n${rows}\n};\nexport const mediaCredit = 'Bryl Lim / Everkinetic · CC BY-SA 4.0';\nexport const mediaSourceUrl = 'https://github.com/bryllim/workout-guide';\nexport const mediaLicenseUrl = 'https://creativecommons.org/licenses/by-sa/4.0/';\n`);
