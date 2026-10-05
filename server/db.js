'use strict';
/* ============================================================================
   Content database.
   The JSON database (server/data/content.json) is extracted once from the
   bundled js/data.js and is then managed through the admin panel API.
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..'); // project root
const DATA_JS_PATH = path.join(ROOT, 'js', 'data.js');
const DATA_DIR = process.env.PORTFOLIO_DATA_DIR
  ? path.resolve(process.env.PORTFOLIO_DATA_DIR)
  : path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'content.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const BACKUP_KEEP = 20; // number of automatic backups to retain

/* ==================== Automatic backups (with rotation) ==================== */

function backupStamp(d) {
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) +
    '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
}

// Snapshot the given data to server/data/backups/backup-<timestamp>.json and
// keep only the newest BACKUP_KEEP backups.
function createBackup(data) {
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
  if (!fs.existsSync(BACKUP_DIR)) return [];
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
  fs.mkdirSync(DATA_DIR, { recursive: true });
  // Snapshot the incoming state before it becomes the live database, then
  // rotate so only the newest BACKUP_KEEP backups are retained.
  try { createBackup(data); } catch (e) { console.error('[db] backup failed:', e.message); }
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, DB_PATH);
}

function initDatabase({ force = false } = {}) {
  if (!force && fs.existsSync(DB_PATH)) {
    console.log('[db] content.json already exists; skipping init. Use --force to rebuild.');
    return readDatabase();
  }
  const data = extractFromDataJs();
  writeDatabase(data);
  console.log('[db] Initialized server/data/content.json from js/data.js (' + Object.keys(data).length + ' sections).');
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

module.exports = { ROOT, DATA_DIR, DB_PATH, DATA_JS_PATH, BACKUP_DIR, BACKUP_KEEP, extractFromDataJs, readDatabase, writeDatabase, initDatabase, exportDataJs, createBackup, listBackups, readBackup };
