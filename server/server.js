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
const { sendMail, escHtml } = require('./email');

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

/* ==================== Raw body / rate limits / uploads ==================== */
function readRawBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(new Error('payload too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const rateBuckets = new Map(); // key -> { count, resetAt }
function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const e = rateBuckets.get(key);
  if (!e || now > e.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }
  if (e.count >= max) return { ok: false, remaining: 0 };
  e.count += 1;
  return { ok: true, remaining: max - e.count };
}

const UPLOAD_ROOT = path.join(STATIC_ROOT, 'assets', 'uploads');
const FOLDER_RULES = {
  profile: { kinds: ['image'], max: 8 * 1024 * 1024 },
  certificates: { kinds: ['image'], max: 8 * 1024 * 1024 },
  projects: { kinds: ['image'], max: 12 * 1024 * 1024 },
  videos: { kinds: ['video'], max: 60 * 1024 * 1024 },
  docs: { kinds: ['application/pdf'], max: 10 * 1024 * 1024 }
};
const EXT_OK = {
  'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/gif': ['.gif'], 'image/webp': ['.webp'],
  'video/mp4': ['.mp4'], 'video/webm': ['.webm'], 'application/pdf': ['.pdf']
};

// Validate a file by its magic bytes, never by the client-supplied name alone.
function sniffType(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 && buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a) return 'image/png';
  if (buf.length >= 3 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif';
  if (buf.length >= 12 && buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (buf.length >= 8 && buf.slice(4, 8).toString('ascii') === 'ftyp') return 'video/mp4';
  if (buf.length >= 4 && buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return 'video/webm';
  if (buf.length >= 5 && buf.toString('ascii', 0, 5) === '%PDF-') return 'application/pdf';
  return 'application/octet-stream';
}

function parseMultipart(buf, boundary) {
  const parts = [];
  const delim = Buffer.from('--' + boundary);
  let idx = buf.indexOf(delim);
  while (idx !== -1) {
    let start = idx + delim.length;
    if (buf.slice(start, start + 2).toString() === '--') break; // closing delimiter
    if (buf[start] === 0x0d) start += 2; // skip CRLF after delimiter
    const headerEnd = buf.indexOf(Buffer.from('\r\n\r\n'), start);
    if (headerEnd === -1) break;
    const headers = buf.slice(start, headerEnd).toString('utf8');
    const next = buf.indexOf(delim, headerEnd + 4);
    if (next === -1) break;
    let bodyEnd = next;
    if (bodyEnd >= 2 && buf[bodyEnd - 2] === 0x0d && buf[bodyEnd - 1] === 0x0a) bodyEnd -= 2;
    parts.push({ headers, name: '', filename: null, contentType: '', data: buf.slice(headerEnd + 4, bodyEnd) });
    const part = parts[parts.length - 1];
    const cd = (headers.match(/content-disposition:[^\r\n]*/i) || [''])[0];
    const nameM = cd.match(/name="([^"]*)"/i);
    const fileM = cd.match(/filename="([^"]*)"/i);
    const typeM = headers.match(/content-type:\s*([^\r\n]+)/i);
    part.name = nameM ? nameM[1] : '';
    part.filename = fileM ? fileM[1] : null;
    part.contentType = typeM ? typeM[1].trim() : '';
    idx = next;
  }
  return parts;
}

function safeResolveUpload(urlPath) {
  let rel;
  try { rel = decodeURIComponent(String(urlPath || '').replace(/^\/+/, '')); } catch (e) { return null; }
  const full = path.normalize(path.join(UPLOAD_ROOT, rel));
  if (full !== UPLOAD_ROOT && !full.startsWith(UPLOAD_ROOT + path.sep)) return null;
  return full;
}

function listUploads(dir = UPLOAD_ROOT, prefix = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  fs.readdirSync(dir, { withFileTypes: true }).forEach(d => {
    const rel = prefix ? prefix + '/' + d.name : d.name;
    const full = path.join(dir, d.name);
    if (d.isDirectory()) out.push.apply(out, listUploads(full, rel));
    else {
      try {
        out.push({ url: '/assets/uploads/' + rel.split(path.sep).join('/'), size: fs.statSync(full).size });
      } catch (e) { /* ignore */ }
    }
  });
  return out.sort((a, b) => a.url.localeCompare(b.url));
}

function maskEmailCfg(e) {
  return { enabled: !!e.enabled, host: e.host, port: e.port, secure: !!e.secure, user: e.user, from: e.from, to: e.to, hasPass: !!e.pass };
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

  // Admin: upload a file (multipart: field "folder" + file part)
  if (method === 'POST' && pathname === '/api/upload') {
    const a = auth(req);
    if (!a.ok) return sendError(res, 401, 'unauthorized');
    const ct = req.headers['content-type'] || '';
    const bm = ct.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
    if (!bm) return sendError(res, 400, 'expected multipart/form-data');
    const buf = await readRawBody(req, config.uploadMaxBytes).catch(() => null);
    if (!buf) return sendError(res, 413, 'upload too large or could not be read');
    const parts = parseMultipart(buf, bm[1] || bm[2]);
    const folderPart = parts.find(p => p.name === 'folder');
    const filePart = parts.find(p => p.filename);
    const folder = folderPart ? folderPart.data.toString('utf8').trim() : '';
    if (!FOLDER_RULES[folder]) {
      return sendError(res, 400, 'unknown upload folder; use: ' + Object.keys(FOLDER_RULES).join(', '));
    }
    if (!filePart || !filePart.data.length) {
      const detail = 'received parts: ' + parts.map(p => p.name + (p.filename ? '<' + p.filename + '>' : '')).join(', ') + ' | boundary ' + String(bm[1] || bm[2]).slice(0, 24);
      return sendError(res, 400, 'no file provided (' + detail + ')');
    }
    const mime = sniffType(filePart.data);
    const rule = FOLDER_RULES[folder];
    if (!rule.kinds.some(k => mime.startsWith(k))) {
      return sendError(res, 415, 'file type not allowed in the ' + folder + ' folder');
    }
    const ext = path.extname(filePart.filename).toLowerCase();
    if (!(EXT_OK[mime] || []).includes(ext)) {
      return sendError(res, 415, 'file extension ' + (ext || '(missing)') + ' does not match its contents');
    }
    if (filePart.data.length > rule.max) {
      return sendError(res, 413, 'file exceeds the ' + Math.round(rule.max / 1048576) + ' MB limit for the ' + folder + ' folder');
    }
    const dir = path.join(UPLOAD_ROOT, folder);
    fs.mkdirSync(dir, { recursive: true });
    const name = Date.now() + '-' + crypto.randomBytes(4).toString('hex') + ext;
    const dest = path.join(dir, name);
    fs.writeFileSync(dest, filePart.data);
    return sendJson(res, 200, { ok: true, url: '/assets/uploads/' + folder + '/' + name, mime, size: filePart.data.length });
  }

  // Admin: list uploaded files
  if (method === 'GET' && pathname === '/api/uploads') {
    const a = auth(req);
    if (!a.ok) return sendError(res, 401, 'unauthorized');
    return sendJson(res, 200, { ok: true, files: listUploads() });
  }

  // Admin: delete an uploaded file (?url=/assets/uploads/<folder>/<file>)
  if (method === 'DELETE' && pathname === '/api/upload') {
    const a = auth(req);
    if (!a.ok) return sendError(res, 401, 'unauthorized');
    const target = url.searchParams.get('url') || '';
    const full = safeResolveUpload(target);
    if (!full || full === UPLOAD_ROOT) return sendError(res, 400, 'invalid path');
    if (!fs.existsSync(full)) return sendError(res, 404, 'file not found');
    fs.unlinkSync(full);
    return sendJson(res, 200, { ok: true });
  }

// Public: contact form endpoint (rate-limited + honeypot protected)
  if (method === 'POST' && pathname === '/api/contact') {
    const ip = req.socket.remoteAddress || 'unknown';
    const rl = rateLimit('msg:' + ip, config.contactRateLimit, 60 * 60000);
    if (!rl.ok) return sendError(res, 429, 'too many messages from this address, try again later');
    const body = await readJsonBody(req, 32 * 1024).catch(() => null);
    if (!body) return sendError(res, 400, 'invalid JSON body');
    if (body.website && String(body.website).length) return sendJson(res, 200, { ok: true }); // honeypot -> pretend success
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();
    if (name.length < 2 || name.length > 100) return sendError(res, 400, 'please provide your name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) return sendError(res, 400, 'please provide a valid email address');
    if (subject.length < 3 || subject.length > 150) return sendError(res, 400, 'please provide a subject');
    if (message.length < 10 || message.length > 5000) return sendError(res, 400, 'message must be between 10 and 5000 characters');
    const e = config.email;
    if (!e.enabled || !e.host || !e.to) return sendError(res, 503, 'email is not configured yet');
    try {
      await sendMail(e, {
        subject: '[Portfolio Contact] ' + subject,
        text: 'Name: ' + name + '\nEmail: ' + email + '\nSubject: ' + subject + '\n\n' + message,
        html: '<h3>New contact message</h3><p><b>Name:</b> ' + escHtml(name) + '<br><b>Email:</b> <a href="mailto:' + escHtml(email) + '">' + escHtml(email) + '</a><br><b>Subject:</b> ' + escHtml(subject) + '</p><hr><p>' + escHtml(message).replace(/\n/g, '<br>') + '</p>'
      });
    } catch (err) {
      console.error('[contact] sending failed:', err.message);
      return sendError(res, 502, 'failed to send the message. Please try the email link instead.');
    }
    return sendJson(res, 200, { ok: true });
  }

  // Public: feedback form endpoint
  if (method === 'POST' && pathname === '/api/feedback') {
    const ip = req.socket.remoteAddress || 'unknown';
    const rl = rateLimit('msg:' + ip, config.contactRateLimit, 60 * 60000);
    if (!rl.ok) return sendError(res, 429, 'too many messages from this address, try again later');
    const body = await readJsonBody(req, 32 * 1024).catch(() => null);
    if (!body) return sendError(res, 400, 'invalid JSON body');
    if (body.website && String(body.website).length) return sendJson(res, 200, { ok: true }); // honeypot -> pretend success
    const name = String(body.name || '').trim().slice(0, 100);
    const feedback = String(body.feedback || '').trim();
    if (feedback.length < 10 || feedback.length > 5000) return sendError(res, 400, 'feedback must be between 10 and 5000 characters');
    const e = config.email;
    if (!e.enabled || !e.host || !e.to) return sendError(res, 503, 'email is not configured yet');
    try {
      await sendMail(e, {
        subject: 'Portfolio feedback from ' + (name || 'a visitor'),
        text: 'Name: ' + (name || 'a visitor') + '\n\n' + feedback,
        html: '<h3>New portfolio feedback</h3><p><b>From:</b> ' + escHtml(name || 'a visitor') + '</p><hr><p>' + escHtml(feedback).replace(/\n/g, '<br>') + '</p>'
      });
    } catch (err) {
      console.error('[feedback] sending failed:', err.message);
      return sendError(res, 502, 'failed to send the feedback. Please use the email link instead.');
    }
    return sendJson(res, 200, { ok: true });
  }

  // Admin: read email settings (password masked)
  if (method === 'GET' && pathname === '/api/email/config') {
    const a = auth(req);
    if (!a.ok) return sendError(res, 401, 'unauthorized');
    return sendJson(res, 200, { ok: true, config: maskEmailCfg(config.email) });
  }

  // Admin: update email settings
  if (method === 'POST' && pathname === '/api/email/config') {
    const a = auth(req);
    if (!a.ok) return sendError(res, 401, 'unauthorized');
    const body = await readJsonBody(req, 16 * 1024).catch(() => null);
    if (!body) return sendError(res, 400, 'invalid JSON body');
    const cur = config.email;
    const host = typeof body.host === 'string' ? body.host.trim() : cur.host;
    const port = Math.max(1, Math.min(65535, parseInt(body.port, 10) || cur.port));
    const from = typeof body.from === 'string' ? body.from.trim() : cur.from;
    const to = typeof body.to === 'string' ? body.to.trim() : cur.to;
    const user = typeof body.user === 'string' ? body.user.trim() : cur.user;
    const pass = typeof body.pass === 'string' && body.pass !== '' ? body.pass : cur.pass;
    config.email = { enabled: !!body.enabled, host, port, secure: !!body.secure, user, pass, from, to };
    writeConfig(config);
    return sendJson(res, 200, { ok: true, config: maskEmailCfg(config.email) });
  }

  // Admin: send a test email
  if (method === 'POST' && pathname === '/api/email/test') {
    const a = auth(req);
    if (!a.ok) return sendError(res, 401, 'unauthorized');
    const e = config.email;
    if (!e.enabled || !e.host || !e.to) return sendError(res, 400, 'email is not configured yet');
    try {
      await sendMail(e, {
        subject: 'Test email from Francis Mwalimu Portfolio',
        text: 'This is a test message from the admin panel.\nIf you are reading this, the email configuration is working.',
        html: '<h3>Test email</h3><p>This is a test message from the admin panel. If you are reading this, the email configuration is working.</p>'
      });
    } catch (err) {
      return sendError(res, 502, 'test failed: ' + err.message);
    }
    return sendJson(res, 200, { ok: true });
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