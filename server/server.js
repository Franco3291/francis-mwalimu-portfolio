'use strict';
/* ============================================================================
   Francis Mwalimu Portfolio — Node.js server (zero runtime dependencies)
   Serves the static site AND the admin content API.

   Public routes
     GET  /api/health          health check
     GET  /api/content         full content (used by the public site)
   Admin routes (session cookie required)
     POST /api/auth/login      { username, password } -> sets cookie
     POST /api/auth/logout
     GET  /api/auth/me
     POST /api/auth/password   { currentPassword, newPassword }
     PUT  /api/content/:section          update one section
     PUT  /api/content                   replace whole content
     GET  /api/export                    download site-ready js/data.js
     GET  /api/backup                    download raw JSON backup
     POST /api/reset                     restore content from bundled js/data.js
   ========================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { readConfig, writeConfig, hashPassword, verifyPassword } = require('./users');
const { ROOT, readDatabase, writeDatabase, initDatabase, exportDataJs } = require('./db');

const config = readConfig();
const STATIC_ROOT = ROOT;

/* ==================== Sessions (in-memory) ==================== */
const sessions = new Map(); // token -> { username, expires }

function createSession(username) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { username, expires: Date.now() + config.sessionTtlHours * 3600 * 1000 });
  return token;
}
function destroySession(token) { sessions.delete(token); }
function isValidSession(token) {
  if (!token) return false;
  const s = sessions.get(token);
  if (!s) return false;
  if (Date.now() > s.expires) { sessions.delete(token); return false; }
  return true;
}

/* ==================== Login rate limiting ==================== */
const loginAttempts = new Map(); // ip -> { count, resetAt }
function isLockedOut(ip) {
  const e = loginAttempts.get(ip);
  if (!e) return false;
  if (Date.now() > e.resetAt) { loginAttempts.delete(ip); return false; }
  return e.count >= config.maxLoginAttempts;
}
function recordFailure(ip) {
  const e = loginAttempts.get(ip) || { count: 0, resetAt: Date.now() + config.lockoutMinutes * 60000 };
  if (Date.now() > e.resetAt) { e.count = 0; e.resetAt = Date.now() + config.lockoutMinutes * 60000; }
  e.count += 1;
  loginAttempts.set(ip, e);
  return e.count;
}

/* ==================== Cookies / auth helpers ==================== */
function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(part => {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}
function setSessionCookie(res, token) {
  const secure = config.secureCookies ? '; Secure' : '';
  res.setHeader('Set-Cookie',
    config.sessionName + '=' + token + '; HttpOnly; Path=/; SameSite=Lax; Max-Age=' + (config.sessionTtlHours * 3600) + secure);
}
function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', config.sessionName + '=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
}
function auth(req) {
  const token = parseCookies(req)[config.sessionName];
  if (!isValidSession(token)) return { ok: false };
  return { ok: true, username: sessions.get(token).username };
}

/* ==================== Request body ==================== */
function readJsonBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(new Error('payload too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve(null);
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch (e) { reject(new Error('invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

/* ==================== Responses ==================== */
function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}
function sendError(res, status, message) { sendJson(res, status, { ok: false, error: message }); }

/* ==================== Static files ==================== */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.pdf': 'application/pdf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.map': 'application/json'
};
function contentType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function serveStatic(req, res, pathname) {
  const target = pathname === '/' ? '/index.html' : pathname;
  let fullPath;
  try {
    fullPath = path.normalize(path.join(STATIC_ROOT, decodeURIComponent(target)));
  } catch (e) {
    return sendError(res, 400, 'bad request');
  }
  if (fullPath !== STATIC_ROOT && !fullPath.startsWith(STATIC_ROOT + path.sep)) {
    return sendError(res, 403, 'forbidden');
  }
  fs.stat(fullPath, (err, stat) => {
    if (err || !stat.isFile()) return sendError(res, 404, 'not found');
    if (req.method === 'HEAD') {
      res.writeHead(200, { 'Content-Type': contentType(fullPath), 'Content-Length': stat.size });
      return res.end();
    }
    const stream = fs.createReadStream(fullPath);
    const isHtml = path.extname(fullPath).toLowerCase() === '.html';
    res.writeHead(200, {
      'Content-Type': contentType(fullPath),
      'Content-Length': stat.size,
      'Cache-Control': isHtml ? 'no-cache' : 'public, max-age=3600'
    });
    stream.pipe(res);
  });
}

/* ==================== API routing ==================== */
async function handleApi(req, res, url) {
  const method = req.method;
  const pathname = url.pathname;

  // Public: health
  if (method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, name: 'francis-mwalimu-portfolio', uptime: process.uptime() });
  }

  // Public: full content read
  if (method === 'GET' && pathname === '/api/content') {
    return sendJson(res, 200, readDatabase());
  }

  // Admin: download raw JSON backup
  if (method === 'GET' && pathname === '/api/backup') {
    if (!auth(req).ok) return sendError(res, 401, 'unauthorized');
    const body = JSON.stringify(readDatabase(), null, 2) + '\n';
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="portfolio-backup.json"',
      'Content-Length': Buffer.byteLength(body)
    });
    return res.end(body);
  }

  // Admin: download site-ready js/data.js
  if (method === 'GET' && pathname === '/api/export') {
    if (!auth(req).ok) return sendError(res, 401, 'unauthorized');
    const body = exportDataJs(readDatabase());
    res.writeHead(200, {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Content-Disposition': 'attachment; filename="data.js"',
      'Content-Length': Buffer.byteLength(body)
    });
    return res.end(body);
  }

  // Admin: login
  if (method === 'POST' && pathname === '/api/auth/login') {
    const ip = req.socket.remoteAddress || 'unknown';
    if (isLockedOut(ip)) return sendError(res, 429, 'too many attempts, try again later');
    const body = await readJsonBody(req, 16 * 1024).catch(() => null);
    const username = body && body.username;
    const password = body && body.password;
    const creds = config.credentials;
    if (!creds) return sendError(res, 500, 'admin account is not configured (run: node server/scripts/set-password.js)');
    if (typeof username === 'string' && typeof password === 'string' &&
        username === creds.username && verifyPassword(password, creds)) {
      loginAttempts.delete(ip);
      setSessionCookie(res, createSession(creds.username));
      return sendJson(res, 200, { ok: true, username: creds.username });
    }
    const count = recordFailure(ip);
    return sendError(res, 401, 'invalid credentials (attempt ' + count + ')');
  }

  // Admin: logout
  if (method === 'POST' && pathname === '/api/auth/logout') {
    destroySession(parseCookies(req)[config.sessionName]);
    clearSessionCookie(res);
    return sendJson(res, 200, { ok: true });
  }

  // Admin: current session
  if (method === 'GET' && pathname === '/api/auth/me') {
    const a = auth(req);
    if (!a.ok) return sendError(res, 401, 'unauthorized');
    return sendJson(res, 200, { ok: true, username: a.username });
  }

  // Admin: change password
  if (method === 'POST' && pathname === '/api/auth/password') {
    const a = auth(req);
    if (!a.ok) return sendError(res, 401, 'unauthorized');
    const body = await readJsonBody(req, 16 * 1024).catch(() => null);
    if (!body || typeof body.currentPassword !== 'string' || typeof body.newPassword !== 'string') {
      return sendError(res, 400, 'currentPassword and newPassword are required');
    }
    const creds = config.credentials;
    if (!creds || !verifyPassword(body.currentPassword, creds)) {
      return sendError(res, 403, 'current password is incorrect');
    }
    if (body.newPassword.length < 8) {
      return sendError(res, 400, 'new password must be at least 8 characters');
    }
    config.credentials = Object.assign({ username: creds.username }, hashPassword(body.newPassword));
    writeConfig(config);
    return sendJson(res, 200, { ok: true });
  }

  // Admin: update a single section
  const sectionMatch = pathname.match(/^\/api\/content\/([^/]+)$/);
  if (method === 'PUT' && sectionMatch) {
    const a = auth(req);
    if (!a.ok) return sendError(res, 401, 'unauthorized');
    const section = decodeURIComponent(sectionMatch[1]);
    const db = readDatabase();
    if (!Object.prototype.hasOwnProperty.call(db, section)) {
      return sendError(res, 404, 'unknown section: ' + section);
    }
    const value = await readJsonBody(req, config.maxBodyBytes).catch(() => null);
    if (value === null) return sendError(res, 400, 'invalid JSON body');
    db[section] = value;
    writeDatabase(db);
    return sendJson(res, 200, { ok: true, section, value: db[section] });
  }

  // Admin: replace whole content
  if (method === 'PUT' && pathname === '/api/content') {
    const a = auth(req);
    if (!a.ok) return sendError(res, 401, 'unauthorized');
    const body = await readJsonBody(req, config.maxBodyBytes).catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return sendError(res, 400, 'invalid JSON body');
    }
    const db = readDatabase();
    const sanitized = {};
    Object.keys(db).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(body, key)) sanitized[key] = body[key];
    });
    writeDatabase(sanitized);
    return sendJson(res, 200, { ok: true });
  }

  // Admin: reset content from bundled js/data.js
  if (method === 'POST' && pathname === '/api/reset') {
    const a = auth(req);
    if (!a.ok) return sendError(res, 401, 'unauthorized');
    initDatabase({ force: true });
    return sendJson(res, 200, { ok: true, value: readDatabase() });
  }

  return sendError(res, 404, 'api route not found');
}

/* ==================== HTTP server ==================== */
const server = http.createServer(async (req, res) => {
  let url;
  try { url = new URL(req.url, 'http://localhost'); }
  catch (e) { return sendError(res, 400, 'bad request'); }
  const pathname = url.pathname;

  if (pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }

  if (pathname.startsWith('/api/')) {
    try {
      await handleApi(req, res, url);
    } catch (e) {
      if (!res.headersSent) sendError(res, 500, 'server error: ' + e.message);
      else { try { res.end(); } catch (err) { /* ignore */ } }
    }
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res, pathname);
  sendError(res, 405, 'method not allowed');
});

server.listen(config.port, config.host, () => {
  const creds = config.credentials;
  console.log('Francis Mwalimu Portfolio server running:');
  console.log('  Public site : http://localhost:' + config.port + '/');
  console.log('  Admin panel : http://localhost:' + config.port + '/admin.html');
  console.log('  Admin user  : ' + (creds ? creds.username : 'NOT CONFIGURED (run: node server/scripts/set-password.js)'));
});