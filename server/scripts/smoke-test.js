'use strict';
/* ============================================================================
   API smoke test — run against a running server.
   Usage: node server/scripts/smoke-test.js [base-url] [username] [password]
   Example: node server/scripts/smoke-test.js http://localhost:3000 admin changeme-123
   ========================================================================== */

const BASE = process.argv[2] || 'http://localhost:3000';
const USER = process.argv[3] || 'admin';
const PASS = process.argv[4] || 'changeme-123';

let cookie = '';
let failures = 0;

async function req(method, path, body, useCookie = true) {
  const opts = { method, headers: {} };
  if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  if (cookie && useCookie) opts.headers['Cookie'] = cookie;
  const res = await fetch(BASE + path, opts);
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch (e) { data = null; }
  const setCookie = res.headers.get('set-cookie');
  if (setCookie && method === 'POST' && path === '/api/auth/login') cookie = setCookie.split(';')[0];
  return { status: res.status, data, text };
}

function check(name, cond, extra) {
  if (cond) { console.log('  PASS  ' + name); }
  else {
    failures++;
    console.log('  FAIL  ' + name + (extra ? '  -> ' + extra : ''));
  }
}

async function main() {
  console.log('Smoke test against ' + BASE);

  console.log('\n[public]');
  const health = await req('GET', '/api/health');
  check('GET /api/health returns ok', health.status === 200 && health.data && health.data.ok === true, 'status=' + health.status);

  const content = await req('GET', '/api/content');
  const sectionCount = content.data ? Object.keys(content.data).length : 0;
  check('GET /api/content has 16 sections', content.status === 200 && sectionCount === 16, 'status=' + content.status + ' sections=' + sectionCount);
  check('  content has projects+personal', content.data && content.data.personal && content.data.projects);

  const home = await req('GET', '/');
  check('GET / serves index.html', home.status === 200 && home.text.includes('Francis Mwalimu'), 'status=' + home.status);

  const admin = await req('GET', '/admin.html');
  check('GET /admin.html served', admin.status === 200 && admin.text.includes('Admin Panel'), 'status=' + admin.status);

  const detail = await req('GET', '/project.html?id=ai-content-detection');
  check('GET /project.html?id=... served (query string)', detail.status === 200 && detail.text.includes('Project'), 'status=' + detail.status);

  const robots = await req('GET', '/robots.txt');
  check('robots.txt disallows /admin.html & /api/', robots.status === 200 && robots.text.includes('Disallow: /admin.html') && robots.text.includes('Disallow: /api/'), 'status=' + robots.status);

  console.log('\n[auth]');
  const meAnon = await req('GET', '/api/auth/me', undefined, false);
  check('GET /api/auth/me (anonymous) -> 401', meAnon.status === 401, 'status=' + meAnon.status);

  const badLogin = await req('POST', '/api/auth/login', { username: USER, password: 'wrong-password' });
  check('bad login -> 401', badLogin.status === 401, 'status=' + badLogin.status);

  const goodLogin = await req('POST', '/api/auth/login', { username: USER, password: PASS });
  check('good login -> 200 + cookie', goodLogin.status === 200 && cookie !== '', 'status=' + goodLogin.status);

  const me = await req('GET', '/api/auth/me');
  check('GET /api/auth/me (session) -> 200', me.status === 200 && me.data && me.data.username === USER, 'status=' + me.status);

  console.log('\n[content writes]');
  const putAnon = await req('PUT', '/api/content/personal', { name: 'x' }, false);
  check('PUT without session -> 401', putAnon.status === 401, 'status=' + putAnon.status);

  const putSection = await req('PUT', '/api/content/personal', content.data.personal);
  check('PUT /api/content/personal (round-trip) -> 200', putSection.status === 200 && putSection.data && putSection.data.ok === true, 'status=' + putSection.status);

  const putUnknown = await req('PUT', '/api/content/nope', {});
  check('PUT unknown section -> 404', putUnknown.status === 404, 'status=' + putUnknown.status);

  console.log('\n[exports & backups]');
  const exportAnon = await req('GET', '/api/export', undefined, false);
  check('GET /api/export (anonymous) -> 401', exportAnon.status === 401, 'status=' + exportAnon.status);

  const exportOk = await req('GET', '/api/export');
  check('GET /api/export -> js data.js', exportOk.status === 200 && exportOk.text.includes('var PORTFOLIO_DATA'), 'status=' + exportOk.status);

  const backupOk = await req('GET', '/api/backup');
  check('GET /api/backup -> JSON', backupOk.status === 200, 'status=' + backupOk.status);

  console.log('\n[password + logout]');
  const pw = await req('POST', '/api/auth/password', { currentPassword: PASS, newPassword: 'changeme-123' });
  check('POST /api/auth/password (same pw) -> 200', pw.status === 200, 'status=' + pw.status);

  const logout = await req('POST', '/api/auth/logout', {});
  check('POST /api/auth/logout -> 200', logout.status === 200, 'status=' + logout.status);
  cookie = '';
  const meAfter = await req('GET', '/api/auth/me');
  check('me after logout -> 401', meAfter.status === 401, 'status=' + meAfter.status);

  console.log('');
  if (failures) { console.log(failures + ' check(s) FAILED'); process.exit(1); }
  console.log('All checks passed.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });