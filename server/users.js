'use strict';
/* ============================================================================
   Admin credentials & server configuration.
   The admin password is stored only as a salted scrypt hash in
   server/config.json (which is git-ignored). Never commit this file.
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONFIG_PATH = path.join(__dirname, 'config.json');

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

function defaultConfig() {
  return {
    port: 3000,
    host: '0.0.0.0',
    secureCookies: false, // set true when serving over HTTPS
    sessionName: 'fm_admin',
    sessionTtlHours: 8,
    maxLoginAttempts: 5,
    lockoutMinutes: 15,
    maxBodyBytes: 3 * 1024 * 1024,
    uploadMaxBytes: 60 * 1024 * 1024, // max single file upload (60 MB)
    contactRateLimit: 5, // contact/feedback messages per hour per IP
    email: {
      enabled: false,
      host: '',
      port: 465,
      secure: true,
      user: '',
      pass: '',
      from: '',
      to: ''
    },
    credentials: null // { username, salt, hash, N, r, p, keylen }
  };
}

function readConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      return Object.assign(defaultConfig(), cfg);
    } catch (e) {
      console.error('[users] Could not parse config.json, using defaults:', e.message);
    }
  }
  return defaultConfig();
}

function writeConfig(cfg) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  const tmp = CONFIG_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, CONFIG_PATH);
}

function hashPassword(password, params = SCRYPT) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, params.keylen, {
    N: params.N, r: params.r, p: params.p
  }).toString('hex');
  return { salt, hash, N: params.N, r: params.r, p: params.p, keylen: params.keylen };
}

function verifyPassword(password, stored) {
  if (!stored || !stored.salt || !stored.hash) return false;
  try {
    const derived = crypto.scryptSync(String(password), stored.salt, stored.keylen || 64, {
      N: stored.N || SCRYPT.N, r: stored.r || SCRYPT.r, p: stored.p || SCRYPT.p
    });
    const expected = Buffer.from(stored.hash, 'hex');
    return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
  } catch (e) {
    return false;
  }
}

function setCredentials(username, password) {
  const cfg = readConfig();
  cfg.credentials = Object.assign({ username: String(username).trim() }, hashPassword(password));
  writeConfig(cfg);
  return cfg;
}

module.exports = { readConfig, writeConfig, hashPassword, verifyPassword, setCredentials, CONFIG_PATH };
