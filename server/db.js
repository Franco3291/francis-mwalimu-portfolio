'use strict';
/* ============================================================================
   Content database.
   The JSON database (server/data/content.json) is extracted once from the
   bundled js/data.js and is then managed through the admin panel API.
   ========================================================================== */
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..'); // project root
const DATA_JS_PATH = path.join(ROOT, 'js', 'data.js');

// Where the content DB lives: PORTFOLIO_DATA_DIR when set, else server/data.
// Some hosts (e.g. Render's free plan) leave the configured path unwritable —
// /var/data has no disk mounted, so mkdir fails with EACCES. Instead of letting
// every request fail, we fall back to a temp directory and finally to an
// in-memory store so the site keeps serving the bundled content.
const BUNDLED_DATA_DIR = path.join(__dirname, 'data');
const TEMP_DATA_DIR = path.join(os.tmpdir(), 'portfolio-db');

// Create dir (recursively) and confirm it is actually writable.
function isDirWritable(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    const probe = path.join(dir, '.write-probe-' + process.pid);
    fs.writeFileSync(probe, 'ok');
    fs.unlinkSync(probe);
    return true;
  } catch (e) {
    return false;
  }
}

// Pick the first writable candidate. When a data dir is explicitly configured
// (a persistent disk, say) and it is not writable, prefer the temp dir before
// the bundled one; without a configured dir keep the bundled default so local
// development is unchanged.
function resolveDataDir() {
  const configured = process.env.PORTFOLIO_DATA_DIR
    ? path.resolve(process.env.PORTFOLIO_DATA_DIR)
    : null;
  const candidates = configured
    ? [configured, TEMP_DATA_DIR, BUNDLED_DATA_DIR]
    : [BUNDLED_DATA_DIR, TEMP_DATA_DIR];
  for (const dir of candidates) {
    if (isDirWritable(dir)) return dir;
  }
  return null; // nothing writable -> keep everything in memory
}

const RESOLVED_DATA_DIR = resolveDataDir();
const IN_MEMORY = RESOLVED_DATA_DIR === null; // no writable dir available
// When IN_MEMORY this path is a label only (never written to).
const DATA_DIR = RESOLVED_DATA_DIR || BUNDLED_DATA_DIR;
const DB_PATH = path.join(DATA_DIR, 'content.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const BACKUP_KEEP = 20; // number of automatic backups to retain
let memoryStore = null; // live content when IN_MEMORY is true

if (IN_MEMORY) {
  console.warn('[db] No writable data directory found; using an IN-MEMORY store (changes are not persisted).');
} else {
  console.log('[db] Data directory: ' + DATA_DIR);
  const configured = process.env.PORTFOLIO_DATA_DIR
    ? path.resolve(process.env.PORTFOLIO_DATA_DIR)
    : null;
  if (configured && configured !== DATA_DIR) {
    console.warn('[db] Configured PORTFOLIO_DATA_DIR (' + configured + ') is not writable; using ' + DATA_DIR + ' instead.');
  }
}

/* ==================== Automatic backups (with rotation) ==================== */

function backupStamp(d) {
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) +
    '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
}

// Snapshot the given data to server/data/backups/backup-<timestamp>.json and
// keep only the newest BACKUP_KEEP backups.
function createBackup(data) {
  if (IN_MEMORY) return 'memory'; // nothing to persist
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const name = 'backup-' + backupStamp(new Date()) + '.json';
  const tmp = path.join(BACKUP_DIR, name + '.tmp');
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, path.join(BACKUP_DIR, name));
  const files = fs.readdirSync(BACKUP_DIR).filter(f => /^backup-.*\.json$/.test(f)).sort();
  while (files.length > BACKUP_KEEP) {
    const oldest = files.shift();
    try { fs.unlinkSync(path.join(BACKUP_DIR, oldest)); } catch (e) { /* ignore */ }
  }
  return name;
}

function listBackups() {
  if (IN_MEMORY || !fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => /^backup-.*\.json$/.test(f))
    .map(f => {
      const full = path.join(BACKUP_DIR, f);
      let size = 0;
      let mtime = null;
      try {
        const st = fs.statSync(full);
        size = st.size;
        mtime = st.mtime;
      } catch (e) { /* ignore */ }
      return { file: f, size, mtime: mtime ? mtime.toISOString() : null };
    })
    .sort((a, b) => a.file.localeCompare(b.file));
}

// Read a stored backup by its file name. The name is validated so only files
// in the backups directory are ever reachable (no path traversal).
function readBackup(file) {
  if (IN_MEMORY) throw new Error('backups are unavailable while running in-memory');
  if (typeof file !== 'string' || !/^backup-[A-Za-z0-9._-]+\.json$/.test(file)) {
    throw new Error('invalid backup file name');
  }
  const full = path.normalize(path.join(BACKUP_DIR, file));
  if (full !== BACKUP_DIR && !full.startsWith(BACKUP_DIR + path.sep)) {
    throw new Error('invalid backup path');
  }
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
    throw new Error('backup not found: ' + file);
  }
  const raw = fs.readFileSync(full, 'utf8');
  const data = JSON.parse(raw);
  if (!data || typeof data !== 'object' || Array.isArray(data) || !data.personal) {
    throw new Error('backup does not look like a valid content database');
  }
  return data;
}

function extractFromDataJs() {
  const source = fs.readFileSync(DATA_JS_PATH, 'utf8');
  // data.js is a self-contained literal (no browser APIs). Evaluate it in a
  // sandbox to obtain the PORTFOLIO_DATA object.
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(source + '\n; this.__result = PORTFOLIO_DATA;', sandbox, { filename: 'data.js' });
  const data = sandbox.__result;
  if (!data || typeof data !== 'object' || !data.personal) {
    throw new Error('Extracted content does not look like PORTFOLIO_DATA (missing personal section).');
  }
  return data;
}

function readDatabase() {
  if (IN_MEMORY) {
    if (!memoryStore) memoryStore = extractFromDataJs();
    return memoryStore;
  }
  if (!fs.existsSync(DB_PATH)) {
    initDatabase({ force: false });
  }
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error('server/data/content.json is not valid JSON: ' + e.message);
  }
}

function writeDatabase(data) {
  if (IN_MEMORY) {
    memoryStore = data; // keep in memory only; nothing to write to disk
    return;
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  // Snapshot the incoming state before it becomes the live database, then
  // rotate so only the newest BACKUP_KEEP backups are retained.
  try { createBackup(data); } catch (e) { console.error('[db] backup failed:', e.message); }
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, DB_PATH);
}

function initDatabase({ force = false } = {}) {
  if (IN_MEMORY) {
    memoryStore = extractFromDataJs();
    console.log('[db] Seeded in-memory content from js/data.js (' + Object.keys(memoryStore).length + ' sections).');
    return memoryStore;
  }
  if (!force && fs.existsSync(DB_PATH)) {
    console.log('[db] content.json already exists; skipping init. Use --force to rebuild.');
    return readDatabase();
  }
  const data = extractFromDataJs();
  writeDatabase(data);
  console.log('[db] Initialized content.json from js/data.js (' + Object.keys(data).length + ' sections).');
  return data;
}

function exportDataJs(data) {
  const header = '/* ==========================================================================\n'
    + '   Francis Mwalimu - Portfolio Data\n'
    + '   Generated by the admin panel from server/data/content.json.\n'
    + '   Serve via the Node backend, or commit this file to publish the static version.\n'
    + '   ========================================================================== */\n\n';
  return header + 'var PORTFOLIO_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
}

module.exports = { ROOT, DATA_DIR, DB_PATH, DATA_JS_PATH, BACKUP_DIR, BACKUP_KEEP, IN_MEMORY, extractFromDataJs, readDatabase, writeDatabase, initDatabase, exportDataJs, createBackup, listBackups, readBackup };
