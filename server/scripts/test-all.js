'use strict';
/* ============================================================================
   Full test suite runner (npm test).
   - Starts the server (if one is not already running on the configured port)
     and runs the smoke test against it.
   - Stops that server, then runs the feature test (which spawns its own
     server instance plus a fake SMTP inbox and covers uploads, email,
     sitemap/feed, caching, backups and the broken-link checker).
   If a server is already running on port 3000 it is left untouched — only
   the smoke test is run in that case.
   ========================================================================== */
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const PORT = 3000;
let serverChild = null;
let failedSuites = 0;

function portResponds(port) {
  return new Promise(resolve => {
    const r = http.request({ host: '127.0.0.1', port, path: '/api/health', method: 'GET', timeout: 1500 }, res => {
      res.resume();
      r.destroy();
      resolve(true);
    });
    r.on('error', () => resolve(false));
    r.on('timeout', () => { r.destroy(); resolve(false); });
    r.end();
  });
}

function runScript(script) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [path.join(ROOT_DIR, 'server', 'scripts', script)], {
      cwd: ROOT_DIR,
      stdio: 'inherit'
    });
    child.on('exit', code => resolve(code || 0));
  });
}

(async () => {
  const portInUse = await portResponds(PORT);
  if (portInUse) {
    console.log('test-all: server already running on port ' + PORT + ' — using it for the smoke test (feature test skipped).');
  } else {
    serverChild = spawn(process.execPath, [path.join(ROOT_DIR, 'server', 'server.js')], { cwd: ROOT_DIR, stdio: 'inherit' });
    let up = false;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 300));
      if (await portResponds(PORT)) { up = true; break; }
    }
    if (!up) {
      console.error('test-all: server did not start on port ' + PORT);
      process.exit(1);
    }
  }

  let code = await runScript('smoke-test.js');
  if (code) failedSuites++;

  if (serverChild) {
    // feature-test spawns its own server on the same port — shut ours down first.
    serverChild.kill('SIGTERM');
    await new Promise(r => serverChild.on('exit', r));
    serverChild = null;
    await new Promise(r => setTimeout(r, 500));
    code = await runScript('feature-test.js');
    if (code) failedSuites++;
  }

  console.log('');
  if (failedSuites) {
    console.log(failedSuites + ' test suite(s) FAILED');
    process.exit(1);
  }
  console.log('All test suites passed.');
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
