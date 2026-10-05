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
  let cfg;
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const file = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      cfg = Object.assign(defaultConfig(), file);
    } catch (e) {
      console.error('[users] Could not parse config.json, using defaults:', e.message);
      cfg = defaultConfig();
    }
  } else {
    cfg = defaultConfig();
  }
  return applyEnvOverrides(cfg);
}

// Hosting platforms (e.g. Render) configure the server with environment
// variables instead of server/config.json. Env values are applied on top of the
// file (or defaults) so the same code runs locally and in production.
function applyEnvOverrides(cfg) {
  if (process.env.PORT) {
    const n = Number(process.env.PORT);
    if (Number.isInteger(n) && n > 0 && n < 65536) cfg.port = n;
  }
  if (process.env.HOST) cfg.host = String(process.env.HOST).trim();

  // HTTPS termination happens at the platform proxy; mark cookies Secure.
  if (process.env.SECURE_COOKIES !== undefined) {
    cfg.secureCookies = /^(1|true|yes|on)$/i.test(String(process.env.SECURE_COOKIES).trim());
  }
  if (process.env.SESSION_TTL_HOURS) {
    const n = Number(process.env.SESSION_TTL_HOURS);
    if (Number.isInteger(n) && n > 0 && n <= 168) cfg.sessionTtlHours = n;
  }

  // Email delivery from env. Used when server/config.json is not kept (e.g. on
  // ephemeral hosts): if SMTP_HOST is set it defines the effective SMTP config.
  if (process.env.SMTP_HOST && String(process.env.SMTP_HOST).trim()) {
    cfg.email.enabled = process.env.SMTP_TO ? true : cfg.email.enabled;
    cfg.email.host = String(process.env.SMTP_HOST).trim();
    if (process.env.SMTP_PORT) {
      const n = Number(process.env.SMTP_PORT);
      if (Number.isInteger(n) && n > 0 && n < 65536) cfg.email.port = n;
    }
    if (process.env.SMTP_SECURE !== undefined) {
      cfg.email.secure = /^(1|true|yes|tls)$/i.test(String(process.env.SMTP_SECURE).trim());
    }
    if (process.env.SMTP_USER !== undefined) cfg.email.user = String(process.env.SMTP_USER);
    if (process.env.SMTP_PASSWORD !== undefined) cfg.email.pass = String(process.env.SMTP_PASSWORD);
    if (process.env.SMTP_FROM) cfg.email.from = String(process.env.SMTP_FROM).trim();
    if (process.env.SMTP_TO) cfg.email.to = String(process.env.SMTP_TO).trim();
  }

  // First-boot admin account from env. Fresh deploys have no config.json, so
  // the ADMIN_USERNAME/ADMIN_PASSWORD secret pair provisions the account once.
  if (!cfg.credentials && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    const name = String(process.env.ADMIN_USERNAME).trim();
    const pass = String(process.env.ADMIN_PASSWORD);
    if (name && pass.length >= 8) {
      cfg.credentials = Object.assign({ username: name }, hashPassword(pass));
      console.log('[users] Admin account seeded from ADMIN_USERNAME/ADMIN_PASSWORD env.');
    } else {
      console.error('[users] ADMIN_USERNAME/ADMIN_PASSWORD set but invalid (password needs >= 8 chars); admin NOT configured.');
    }
  }
  return cfg;
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
