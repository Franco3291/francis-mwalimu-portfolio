'use strict';
/* Temporary feature test: uploads (magic validation, list, serve, delete),
   contact & feedback through a fake SMTP inbox, email config/test, footer admin link. */
const net = require('net');
const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const BASE = 'http://localhost:3000';
let cookie = '';
let fails = 0;
const inbox = [];

function check(name, cond, extra) {
  if (cond) console.log('  PASS  ' + name);
  else { fails++; console.log('  FAIL  ' + name + (extra ? '  -> ' + extra : '')); }
}

async function req(method, pathname, body, useCookie = true) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  if (cookie && useCookie) opts.headers['Cookie'] = cookie;
  const res = await fetch(BASE + pathname, opts);
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch (e) { data = null; }
  const sc = res.headers.get('set-cookie');
  if (sc && method === 'POST' && pathname === '/api/auth/login') cookie = sc.split(';')[0];
  return { status: res.status, data, text };
}

// --- tiny valid PNG + fake but recognizable MP4 signature ---
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const FAKE_MP4 = Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypmp42', 'ascii'), Buffer.alloc(64)]);

// --- fake SMTP server that records delivered messages ---
let smtpPort;
const smtpServer = net.createServer(sock => {
  let buf = '';
  let state = 'greeting';
  let authPhase = '';
  let dataBuf = [];
  const send = s => sock.write(s + '\r\n');
  send('220 localhost ESMTP test');
  sock.on('data', chunk => {
    buf += chunk.toString('utf8');
    let i;
    while ((i = buf.indexOf('\r\n')) !== -1) {
      const line = buf.slice(0, i);
      buf = buf.slice(i + 2);
      const upper = line.toUpperCase();
      if (state === 'greeting') {
        if (upper.startsWith('EHLO')) { state = 'online'; send('250-localhost\r\n250-AUTH LOGIN PLAIN\r\n250 OK'); }
        else { sock.end(); }
        continue;
      }
      if (authPhase === 'user') { authPhase = 'pass'; send('334 UGFzc3dvcmQ6'); continue; }
      if (authPhase === 'pass') { authPhase = ''; send('235 2.7.0 authenticated'); continue; }
      if (state === 'online') {
        if (upper.startsWith('AUTH')) { authPhase = 'user'; send('334 VXNlcm5hbWU6'); }
        else if (upper.startsWith('DATA')) { state = 'data'; send('354 End data with <CR><LF>.<CR><LF>'); }
        else if (upper.startsWith('QUIT')) { send('221 bye'); sock.end(); }
        else send('250 ok');
        continue;
      }
      if (state === 'data') {
        if (line === '.') { state = 'online'; inbox.push(Buffer.concat(dataBuf).toString('utf8')); dataBuf = []; send('250 queued'); }
        else dataBuf.push(Buffer.from(line + '\r\n'));
      }
    }
  });
});
smtpServer.listen(0, '127.0.0.1', () => { smtpPort = smtpServer.address().port; });

function decodeSubject(mail) {
  const mm = mail.match(/Subject: =\?UTF-8\?B\?([A-Za-z0-9+/=]+)\?=/);
  if (mm) { try { return Buffer.from(mm[1], 'base64').toString('utf8'); } catch (e) { } }
  const raw = mail.match(/Subject: ([^\r\n]*)/i);
  return raw ? raw[1] : '';
}

// Raw HTTP request: keeps response headers (undici fetch hides Content-Encoding).
function rawGet(pathname, headers) {
  return new Promise((resolve, reject) => {
    http.get(BASE + pathname, { headers }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

async function upload(folder, fileBuf, filename, type) {
  const fd = new FormData();
  fd.append('folder', folder);
  fd.append('file', new Blob([fileBuf], { type }), filename);
  const res = await fetch(BASE + '/api/upload', { method: 'POST', body: fd, credentials: 'same-origin', headers: { Cookie: cookie } });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch (e) {}
  return { status: res.status, data };
}

(async () => {
  await new Promise(r => setTimeout(r, 300));
  console.log('SMTP test inbox on port ' + smtpPort);

  const ROOT_DIR = path.join(__dirname, '..', '..');
  const child = spawn('node', [path.join(ROOT_DIR, 'server', 'server.js')], { cwd: ROOT_DIR, stdio: 'ignore' });
  await new Promise(resolve => {
    const t0 = Date.now();
    const poll = async () => {
      try {
        const r = await fetch(BASE + '/api/health');
        if (r.ok) return resolve();
      } catch (e) { /* not up yet */ }
      if (Date.now() - t0 > 8000) { console.log('FAIL  server did not start'); process.exit(1); }
      setTimeout(poll, 300);
    };
    poll();
  });

  const login = await req('POST', '/api/auth/login', { username: 'admin', password: 'changeme-123' });
  check('admin login', login.status === 200);
  const mainJs = await req('GET', '/js/main.js');
  check('footer renders Admin link (js/main.js)', mainJs.status === 200 && mainJs.text.indexOf('href="admin.html"') > -1, 'status=' + mainJs.status);
  check('project detail still served', (await req('GET', '/project.html?id=ai-content-detection')).status === 200);

  console.log('\n[uploads]');
  const preUploadUrls = new Set((await req('GET', '/api/uploads')).data.files.map(f => f.url));
  const badFolder = await upload('nope', PNG, 'x.png', 'image/png');
  check('bad folder -> 400', badFolder.status === 400, 'status=' + badFolder.status);

  const fakeImg = await upload('projects', Buffer.from('not an image, really text'), 'fake.png', 'image/png');
  check('mismatched magic -> 415', fakeImg.status === 415, 'status=' + fakeImg.status);

  const extMiss = await upload('projects', PNG, 'x.txt', 'image/png');
  check('extension not allowed for content -> 415', extMiss.status === 415, 'status=' + extMiss.status);

  const upImg = await upload('projects', PNG, 'shot.png', 'image/png');
  check('valid PNG upload -> 200 + url', upImg.status === 200 && /^\/assets\/uploads\/projects\//.test(upImg.data.url), 'status=' + upImg.status);
  const imgUrl = upImg.data.url;
  const served = await fetch(BASE + imgUrl);
  const servedType = served.headers.get('content-type') || '';
  check('uploaded file is served', served.ok && servedType.indexOf('image/png') > -1, served.status + ' ' + servedType);

  const upVid = await upload('videos', FAKE_MP4, 'clip.mp4', 'video/mp4');
  check('valid mp4 upload (magic ftyp) -> 200', upVid.status === 200, 'status=' + upVid.status);
  const vidUrl = upVid.data.url;

  const upCert = await upload('certificates', PNG, 'proof.png', 'image/png');
  check('certificate image upload -> 200', upCert.status === 200, 'status=' + upCert.status);
  const certUrl = upCert.data.url;

  const listed = await req('GET', '/api/uploads');
  check('GET /api/uploads lists files', listed.status === 200 && listed.data.files.some(f => f.url === imgUrl), 'status=' + listed.status);

  const delOk = await req('DELETE', '/api/upload?url=' + encodeURIComponent(imgUrl));
  check('DELETE uploaded file -> 200', delOk.status === 200, 'status=' + delOk.status);
  const afterDel = await req('GET', '/api/uploads');
  check('file gone after delete', !afterDel.data.files.some(f => f.url === imgUrl));

console.log('\n[email]');
  const cfgAnon = await req('GET', '/api/email/config', undefined, false);
  check('email config requires auth', cfgAnon.status === 401, 'status=' + cfgAnon.status);

  const cfgSave = await req('POST', '/api/email/config', {
    enabled: true, host: '127.0.0.1', port: smtpPort, secure: false,
    user: 'smtpuser', pass: 'smtppass', from: 'noreply@example.com', to: 'deliver@example.com'
  });
  check('save email config -> 200', cfgSave.status === 200 && cfgSave.data.config.hasPass === true, 'status=' + cfgSave.status);
  check('password is masked', !JSON.stringify(cfgSave.data.config).includes('smtppass'));

  const badContact = await req('POST', '/api/contact', { name: 'x', email: 'bad', subject: 'hi', message: 'too short' });
  check('invalid contact -> 400', badContact.status === 400, 'status=' + badContact.status);

  const honey = await req('POST', '/api/contact', { website: 'spammy-url', name: 'Bot', email: 'bot@spam.com', subject: 'Viagra', message: 'spam spam spam spam spam' });
  check('honeypot contact silently succeeds', honey.status === 200 && honey.data.ok === true, 'status=' + honey.status);

  const contact = await req('POST', '/api/contact', { name: 'Jane Doe', email: 'jane@example.com', subject: 'Project inquiry', message: 'Hello, I would like to discuss a project with you. Thanks!' });
  check('valid contact -> 200', contact.status === 200, 'status=' + contact.status);

  const feedback = await req('POST', '/api/feedback', { name: 'Sam', feedback: 'The portfolio looks professional and easy to navigate.' });
  check('valid feedback -> 200', feedback.status === 200, 'status=' + feedback.status);

  await new Promise(r => setTimeout(r, 400));
  check('SMTP inbox received ' + inbox.length + ' messages (expect 2)', inbox.length === 2, 'got ' + inbox.length);
  check('contact mail has correct subject', inbox.some(m => decodeSubject(m) === '[Portfolio Contact] Project inquiry'), '');
  check('contact mail contains the message', inbox.some(m => m.includes('Jane Doe') && m.includes('jane@example.com') && m.includes('discuss a project')), '');
  check('feedback mail delivered', inbox.some(m => decodeSubject(m).indexOf('Portfolio feedback from Sam') === 0), '');

  const testMail = await req('POST', '/api/email/test', {});
  check('email test -> 200', testMail.status === 200, 'status=' + testMail.status);
  await new Promise(r => setTimeout(r, 300));
  check('test email received by SMTP inbox', inbox.some(m => decodeSubject(m) === 'Test email from Francis Mwalimu Portfolio'), '');

  let rlStatus = null;
  for (let i = 0; i < 5; i++) {
    const r = await req('POST', '/api/contact', { name: 'Rate Tester', email: 'r@test.com', subject: 'Limits', message: 'Verifying the contact form rate limit applies consistently here.' });
    rlStatus = r.status;
    if (rlStatus !== 200) break;
  }
  check('contact rate limit -> 429 after quota', rlStatus === 429, 'last=' + rlStatus);

  console.log('\n[seo & caching]');
  const sitemap = await fetch(BASE + '/sitemap.xml');
  const sitemapText = await sitemap.text();
  check('GET /sitemap.xml -> 200 + xml', sitemap.status === 200 && /<urlset/.test(sitemapText) && /<loc>/.test(sitemapText), 'status=' + sitemap.status);
  check('sitemap content-type xml', (sitemap.headers.get('content-type') || '').indexOf('xml') > -1, sitemap.headers.get('content-type'));
  check('sitemap lists project pages', sitemapText.indexOf('project.html?id=') > -1);
  check('sitemap lists article pages', sitemapText.indexOf('article.html?id=') > -1);

  const feed = await fetch(BASE + '/feed.xml');
  const feedText = await feed.text();
  check('GET /feed.xml -> 200 Atom', feed.status === 200 && /<feed /.test(feedText) && /<entry>/.test(feedText), 'status=' + feed.status);
  check('feed has updated timestamp', /<updated>/.test(feedText));
  check('feed links to blog posts', feedText.indexOf('article.html?id=blog-') > -1);

  const cssAnon = await rawGet('/css/style.css', {});
  check('static served with ETag', cssAnon.status === 200 && /^"/.test(cssAnon.headers.etag || ''), 'etag=' + cssAnon.headers.etag);
  const css304 = await rawGet('/css/style.css', { 'If-None-Match': cssAnon.headers.etag });
  check('If-None-Match -> 304', css304.status === 304, 'status=' + css304.status);

  const gz = await rawGet('/css/style.css', { 'Accept-Encoding': 'gzip' });
  check('gzip: Content-Encoding= gzip', gz.headers['content-encoding'] === 'gzip', 'enc=' + gz.headers['content-encoding']);
  check('gzip: Vary includes Accept-Encoding', /accept-encoding/i.test(gz.headers.vary || ''), 'vary=' + gz.headers.vary);
  check('gzip: body is deflated (magic 1f 8b)', gz.body.length > 2 && gz.body[0] === 0x1f && gz.body[1] === 0x8b);

  const rootRaw = await rawGet('/', {});
  check('security headers: nosniff', rootRaw.headers['x-content-type-options'] === 'nosniff', rootRaw.headers['x-content-type-options']);
  check('security headers: X-Frame-Options DENY', rootRaw.headers['x-frame-options'] === 'DENY');
  check('security headers: CSP present', /default-src 'self'/.test(rootRaw.headers['content-security-policy'] || ''), rootRaw.headers['content-security-policy']);
  check('security headers: Referrer-Policy', rootRaw.headers['referrer-policy'] === 'strict-origin-when-cross-origin');

  console.log('\n[backups & links]');
  const linksAnon = await req('GET', '/api/check-links', undefined, false);
  check('check-links requires auth', linksAnon.status === 401, 'status=' + linksAnon.status);
  const links = await req('GET', '/api/check-links');
  check('check-links -> 200', links.status === 200 && Array.isArray(links.data.missing), 'status=' + links.status);
  check('check-links scanned > 0 references', typeof links.data.checked === 'number' && links.data.checked > 0, 'checked=' + links.data.checked);

  const preBackups = (await req('GET', '/api/backups')).data.backups.map(b => b.file);
  const backupsAnon = await req('GET', '/api/backups', undefined, false);
  check('backups list requires auth', backupsAnon.status === 401, 'status=' + backupsAnon.status);
  const mk = await req('POST', '/api/backups', {});
  check('create backup -> 200 + file', mk.status === 200 && /^backup-.*\.json$/.test(mk.data.file), 'file=' + mk.data.file);
  const listedBackups = await req('GET', '/api/backups');
  check('backup appears in list', listedBackups.data.backups.some(b => b.file === mk.data.file));

  const restoreAnon = await req('POST', '/api/backups/restore', { file: 'backup-x.json' }, false);
  check('restore requires auth', restoreAnon.status === 401, 'status=' + restoreAnon.status);
  const restoreTraversal = await req('POST', '/api/backups/restore', { file: '../nope.json' });
  check('restore rejects traversal filename', restoreTraversal.status === 400, 'status=' + restoreTraversal.status);
  const restoreBad = await req('POST', '/api/backups/restore', { file: 'backup-does-not-exist.json' });
  check('restore rejects unknown backup', restoreBad.status === 400, 'status=' + restoreBad.status);

  const contentPre = (await req('GET', '/api/content')).data;
  const restoreOk = await req('POST', '/api/backups/restore', { file: mk.data.file });
  check('restore own backup -> 200', restoreOk.status === 200, 'status=' + restoreOk.status);
  const contentPost = (await req('GET', '/api/content')).data;
  check('content is a valid database after restore', !!(contentPost.personal && contentPost.personal.name), 'name=' + (contentPost.personal && contentPost.personal.name));
  check('restoring a snapshot preserves its content', contentPre.personal && contentPre.personal.name === contentPost.personal.name);

  const dl = await rawGet('/api/backup?file=' + encodeURIComponent(mk.data.file), { Cookie: cookie });
  check('download specific backup -> json', dl.status === 200 && (dl.headers['content-type'] || '').indexOf('application/json') > -1, 'status=' + dl.status + ' ct=' + dl.headers['content-type']);
  const dlBad = await rawGet('/api/backup?file=' + encodeURIComponent('../evil.json'), { Cookie: cookie });
  check('download rejects traversal filename', dlBad.status === 400, 'status=' + dlBad.status);

  // Remove only the backups this test created so the directory stays tidy.
  const postBackups = (await req('GET', '/api/backups')).data.backups.map(b => b.file);
  postBackups.filter(f => preBackups.indexOf(f) === -1).forEach(f => {
    try { fs.unlinkSync(path.join(ROOT_DIR, 'server', 'data', 'backups', f)); } catch (e) { /* ignore */ }
  });

  /* ---------- cleanup ---------- */
  await req('DELETE', '/api/upload?url=' + encodeURIComponent(vidUrl));
  await req('DELETE', '/api/upload?url=' + encodeURIComponent(certUrl));
  await req('POST', '/api/email/config', { enabled: false, host: '', port: 465, secure: true, user: '', pass: '', from: '', to: '' });

  const leftover = await req('GET', '/api/uploads');
  const newestFiles = leftover.data.files.filter(f => !preUploadUrls.has(f.url));
  check('no test files left behind', newestFiles.length === 0, JSON.stringify(newestFiles));

  child.kill();
  smtpServer.close();

  console.log('');
  if (fails) { console.log(fails + ' check(s) FAILED'); process.exit(1); }
  console.log('All feature checks passed.');
})().catch(e => { console.error('Error:', e.message); process.exit(1); });