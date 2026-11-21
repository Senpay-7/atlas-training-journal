import { spawn } from 'node:child_process';
import { closeSync, existsSync, mkdirSync, openSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
// Keep the original browser origin: changing it would show a different local database.
const url = 'http://127.0.0.1:8085';
async function available() {
  let response;
  try { response = await fetch(url, { signal: AbortSignal.timeout(1500) }); }
  catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') return false;
    throw new Error(`Cannot reach ${url}: ${error.message}`);
  }
  if (!response.ok || !(await response.text()).includes('<title>ATLAS Training</title>')) {
    throw new Error('Port 8085 is responding, but it is not the ATLAS preview. No process was stopped.');
  }
  return true;
}

try {
  if (!(await available())) {
    if (!existsSync(path.join(root, 'dist', 'index.html'))) throw new Error('The web build is missing. Run npm run build:web first.');
    const tooling = path.join(root, '.tooling');
    mkdirSync(tooling, { recursive: true });
    const logfile = path.join(tooling, 'preview-server.log');
    const log = openSync(logfile, 'a');
    const child = spawn(process.execPath, [path.join(root, 'scripts', 'preview.mjs')], {
      cwd: root, detached: true, windowsHide: true,
      env: { ...process.env, ATLAS_PREVIEW_PORT: '8085' }, stdio: ['ignore', log, log],
    });
    let spawnError;
    child.on('error', error => { spawnError = error; });
    child.unref();
    closeSync(log);
    let ready = false;
    for (let attempt = 0; attempt < 20; attempt++) {
      await delay(250);
      if (spawnError) throw spawnError;
      if (await available()) { ready = true; break; }
    }
    if (!ready) throw new Error(`ATLAS did not start. See ${logfile}`);
    console.log(`ATLAS started: ${url}`);
  } else console.log(`ATLAS is already running: ${url}`);

  // The desktop launcher opens the user's browser. Automated checks use --no-open.
  if (!process.argv.includes('--no-open')) {
    if (process.platform === 'win32') {
      const browser = spawn('cmd.exe', ['/d', '/c', 'start', '', url], { detached: true, windowsHide: true, stdio: 'ignore' });
      browser.on('error', error => console.error(`Open ${url} in your browser: ${error.message}`));
      browser.unref();
    } else console.log(`Open ${url} in your browser.`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
