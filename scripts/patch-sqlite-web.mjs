// Expo SQLite 57.0.4 writes a Uint32 value into a Uint8Array, truncating the
// response length at 255 bytes. Apply the minimal, version-guarded web fix.
// Native SQLite is unaffected. Remove when an upstream release fixes this.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const packagePath = require.resolve('expo-sqlite/package.json');
const metadata = JSON.parse(readFileSync(packagePath, 'utf8'));
const file = path.join(path.dirname(packagePath), 'web', 'WorkerChannel.ts');
const original = 'resultArray.set(new Uint32Array([length]), 0);';
const fixed = 'new DataView(resultBuffer).setUint32(0, length, true); // ATLAS: preserve all four length bytes';
const content = readFileSync(file, 'utf8');
if (metadata.version !== '57.0.4') throw new Error('Review the SQLite web patch for the new package version before continuing.');
if (content.includes(original)) { writeFileSync(file, content.replace(original, fixed)); console.log('Applied Expo SQLite web response-length fix.'); }
else if (!content.includes(fixed)) throw new Error('SQLite web source changed; patch requires review.');
