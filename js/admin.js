'use strict';
/* ============================================================================
   Admin Panel — logic for the content manager (/admin.html)
   Uses the Node backend API (server/server.js).
   ========================================================================== */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  /* ==================== State ==================== */
  let content = null;        // full PORTFOLIO_DATA
  let currentSection = null; // active section name or null
  let jsonMode = false;
  let dirty = false;
  let toolShown = null;      // active tool name or null

  /* ==================== Utilities ==================== */
  function esc(s) {
    const div = document.createElement('div');
    div.textContent = s == null ? '' : String(s);
    return div.innerHTML;
  }

  async function api(path, method, body) {
    const opts = { method: method || 'GET', credentials: 'same-origin', headers: { Accept: 'application/json' } };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(path, opts);
    let data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) throw new Error((data && data.error) || ('Request failed (' + res.status + ')'));
    return data;
  }

  const toastEl = () => $('#toast');
  let toastTimer = null;
  function toast(msg, isError) {
    const el = toastEl();
    el.textContent = msg;
    el.classList.toggle('error', !!isError);
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
  }

  function confirmDialog(message, title) {
    return new Promise(resolve => {
      $('#confirm-title').textContent = title || 'Are you sure?';
      $('#confirm-message').textContent = message || '';
      $('#confirm-mask').classList.remove('hidden');
      const done = ok => {
        $('#confirm-mask').classList.add('hidden');
        $('#confirm-ok').onclick = null;
        $('#confirm-cancel').onclick = null;
        resolve(ok);
      };
      $('#confirm-ok').onclick = () => done(true);
      $('#confirm-cancel').onclick = () => done(false);
    });
  }

  /* ==================== Label helpers ==================== */
  const LABELS = {
    id: 'ID', url: 'URL', githubUrl: 'GitHub URL', liveUrl: 'Live URL',
    documentationUrl: 'Documentation URL', cvUrl: 'CV URL', profileImage: 'Profile image',
    certificateUrl: 'Certificate URL', verificationUrl: 'Verification URL',
    credentialId: 'Credential ID', levelValue: 'Level (%)', contactFormEndpoint: 'Contact form endpoint',
    technologies: 'Technologies', technologiesUsed: 'Technologies used', year: 'Year',
    featured: 'Featured', category: 'Category', status: 'Status'
  };
  function humanLabel(key) {
    if (LABELS[key]) return LABELS[key];
    const words = key.replace(/([A-Z])/g, ' $1').trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
  function isLongString(v) { return typeof v === 'string' && (v.length > 110 || v.indexOf('\n') > -1); }
  function isObject(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function itemLabel(item) {
    const keys = ['title', 'name', 'id', 'label', 'category', 'issuer', 'company', 'client'];
    for (let i = 0; i < keys.length; i++) {
      if (item && item[keys[i]] !== undefined && item[keys[i]] !== null && item[keys[i]] !== '') {
        return String(item[keys[i]]);
      }
    }
    return 'Item';
  }
  function setDirty(v) {
    dirty = v;
    $('#save-hint').classList.toggle('dirty', v);
  }
  function watchDirty(el) { el.addEventListener('input', () => setDirty(true)); }

  /* ==================== Primitive controls ==================== */
  function makeLabel(key) {
    const el = document.createElement('label');
    el.className = 'admin-label';
    el.textContent = humanLabel(key);
    return el;
  }
  function makeInput(key, value) {
    let el;
    if (typeof value === 'boolean') {
      el = document.createElement('input');
      el.type = 'checkbox';
      el.checked = value;
    } else if (typeof value === 'number') {
      el = document.createElement('input');
      el.type = 'number';
      el.value = value === null ? '' : value;
    } else {
      const isLong = isLongString(value);
      if (isLong) {
        el = document.createElement('textarea');
        el.rows = 3;
      } else {
        el = document.createElement('input');
        el.type = 'text';
      }
      el.value = value == null ? '' : value;
      if (key && /url|path|image|file/i.test(key)) el.classList.add('mono');
    }
    el.classList.add('admin-control');
    return el;
  }
  function readInput(el) {
    if (el.type === 'checkbox') return el.checked;
    if (el.type === 'number') return el.value === '' ? null : Number(el.value);
    return el.value;
  }

/* ==================== Generic form rendering ====================
     Introspects the data structure and builds editable forms for any
     combination of objects, arrays, primitives and nulls. */
  function renderObjectForm(container, obj) {
    const keys = Object.keys(obj);
    if (!keys.length) {
      const hint = document.createElement('p');
      hint.className = 'admin-editor-desc';
      hint.textContent = 'This object has no fields yet. Toggle JSON mode to add fields manually.';
      container.appendChild(hint);
      return;
    }
    keys.forEach(key => container.appendChild(renderField(key, obj[key])));
  }

  function renderField(key, value) {
    const wrap = document.createElement('div');
    wrap.className = 'admin-field';
    wrap.dataset.key = key;

    if (isObject(value)) {
      wrap.dataset.type = 'object';
      const title = document.createElement('div');
      title.className = 'admin-group-title';
      title.textContent = humanLabel(key);
      const group = document.createElement('div');
      group.className = 'admin-group';
      const fields = document.createElement('div');
      fields.className = 'admin-fields';
      renderObjectForm(fields, value);
      group.appendChild(fields);
      wrap.appendChild(title);
      wrap.appendChild(group);
    } else if (Array.isArray(value)) {
      wrap.dataset.type = 'array';
      const arrEl = document.createElement('div');
      arrEl.className = 'admin-array';
      renderArrayInto(arrEl, key, value);
      wrap.appendChild(arrEl);
    } else {
      wrap.dataset.type = 'primitive';
      wrap.appendChild(makeLabel(key));
      wrap.appendChild(makeInput(key, value));
    }
    return wrap;
  }

  function renderArrayInto(arrEl, key, arr) {
    const areObjects = arr.length > 0 && isObject(arr[0]);
    const head = document.createElement('div');
    head.className = 'admin-array-head';
    const title = document.createElement('span');
    title.className = 'admin-array-title';
    title.textContent = humanLabel(key);
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn-ghost btn-sm';
    addBtn.textContent = '+ Add item';
    head.appendChild(title);
    head.appendChild(addBtn);

    const items = document.createElement('div');
    items.className = 'admin-array-items';
    items.dataset.arrType = areObjects ? 'objects' : 'primitives';
    arr.forEach(item => items.appendChild(renderArrayItem(items, item)));

    addBtn.addEventListener('click', () => {
      const t = items.dataset.arrType;
      const newItem = t === 'objects' ? {} : '';
      items.appendChild(renderArrayItem(items, newItem));
      setDirty(true);
    });

    arrEl.appendChild(head);
    arrEl.appendChild(items);
  }

  function renderArrayItem(itemsEl, item) {
    if (itemsEl.dataset.arrType === 'objects') {
      const card = document.createElement('div');
      card.className = 'admin-item';
      const bar = document.createElement('div');
      bar.className = 'admin-item-bar';
      const labelEl = document.createElement('span');
      labelEl.className = 'admin-item-label';
      labelEl.textContent = itemsEl.children.length
        ? (itemLabel(item) + ' #' + (itemsEl.children.length + 1))
        : itemLabel(item);
      const controls = document.createElement('div');
      controls.className = 'admin-item-controls';
      ['▲', '▼', '✕'].forEach((sym, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn btn-ghost btn-sm';
        b.textContent = sym;
        b.dataset.act = ['up', 'down', 'del'][i];
        b.title = ['Move up', 'Move down', 'Delete'][i];
        controls.appendChild(b);
      });
      const body = document.createElement('div');
      body.className = 'admin-item-body';
      body.style.display = 'none';
      const fields = document.createElement('div');
      fields.className = 'admin-fields';
      renderObjectForm(fields, item);
      body.appendChild(fields);

      bar.addEventListener('click', e => {
        const act = e.target.closest('[data-act]');
        if (!act) {
          body.style.display = body.style.display === 'none' ? 'block' : 'none';
          return;
        }
        if (act.dataset.act === 'del') {
          card.remove();
          setDirty(true);
        } else if (act.dataset.act === 'up' && card.previousElementSibling) {
          itemsEl.insertBefore(card, card.previousElementSibling);
          setDirty(true);
        } else if (act.dataset.act === 'down' && card.nextElementSibling) {
          itemsEl.insertBefore(card.nextElementSibling, card);
          setDirty(true);
        }
      });

      bar.appendChild(labelEl);
      bar.appendChild(controls);
      card.appendChild(bar);
      card.appendChild(body);
      return card;
    }

    const row = document.createElement('div');
    row.className = 'admin-array-row';
    row.appendChild(makeInput(null, item));
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn btn-ghost btn-sm';
    del.textContent = '✕';
    del.title = 'Delete item';
    del.addEventListener('click', () => {
      row.remove();
      setDirty(true);
    });
    row.appendChild(del);
    return row;
  }

/* ==================== Read values back from the DOM ==================== */
  function collectObject(container) {
    const out = {};
    Array.from(container.children).forEach(child => {
      const key = child.dataset.key;
      if (!key) return;
      const arrEl = child.querySelector(':scope > .admin-array');
      if (arrEl) {
        out[key] = collectArray(arrEl.querySelector('.admin-array-items'));
        return;
      }
      const fieldsEl = child.querySelector(':scope > .admin-group .admin-fields');
      if (fieldsEl) {
        out[key] = collectObject(fieldsEl);
        return;
      }
      const input = child.querySelector('input, textarea');
      if (input) out[key] = readInput(input);
    });
    return out;
  }

  function collectArray(itemsEl) {
    if (!itemsEl) return [];
    const out = [];
    Array.from(itemsEl.children).forEach(child => {
      if (itemsEl.dataset.arrType === 'objects') {
        const fields = child.querySelector('.admin-item-body .admin-fields');
        if (fields) out.push(collectObject(fields));
      } else {
        const input = child.querySelector('input, textarea');
        if (input) out.push(readInput(input));
      }
    });
    return out;
  }

  /* ==================== Editor views ==================== */
  function renderEditor() {
    const bodyEl = $('#editor-body');
    bodyEl.innerHTML = '';
    const fields = document.createElement('div');
    fields.className = 'admin-fields';
    renderObjectForm(fields, content[currentSection]);
    bodyEl.appendChild(fields);
    watchDirty(bodyEl);
  }

  function renderJsonEditor() {
    const bodyEl = $('#editor-body');
    bodyEl.innerHTML = '';
    const ta = document.createElement('textarea');
    ta.className = 'json-editor';
    ta.value = JSON.stringify(content[currentSection], null, 2);
    bodyEl.appendChild(ta);
    watchDirty(ta);
  }

  /* ==================== Actions ==================== */
  async function saveSection() {
    if (!currentSection || toolShown) return;
    const btn = $('#btn-save');
    let value;
    try {
      if (jsonMode) {
        value = JSON.parse($('#editor-body .json-editor').value);
      } else {
        value = collectObject($('#editor-body .admin-fields'));
      }
    } catch (e) {
      toast('Fix invalid JSON before saving: ' + e.message, true);
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      const res = await api('/api/content/' + encodeURIComponent(currentSection), 'PUT', value);
      content[currentSection] = res.value;
      setDirty(false);
      $('#saved-at').textContent = 'Saved ' + new Date().toLocaleTimeString();
      toast('Saved "' + humanLabel(currentSection) + '"');
    } catch (e) {
      toast(e.message, true);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Changes';
    }
  }

  function openSection(name) {
    if (dirty && currentSection && toolShown === null) {
      confirmDialog('You have unsaved changes. Switch sections and lose them?', 'Unsaved changes').then(ok => {
        if (ok) doOpenSection(name);
      });
      return;
    }
    doOpenSection(name);
  }

  function doOpenSection(name) {
    currentSection = name;
    toolShown = null;
    jsonMode = false;
    $('#btn-toggle-json').textContent = 'Edit as JSON';
    $('.admin-actions').style.display = '';
    $('#saved-at').textContent = '';
    setDirty(false);
    updateEditorHead();
    updateNavActive();
    renderEditor();
  }

  function toggleJsonMode() {
    if (!currentSection || toolShown) return;
    if (jsonMode) {
      // switching back requires valid JSON
      try {
        content[currentSection] = JSON.parse($('#editor-body .json-editor').value);
        jsonMode = false;
        $('#btn-toggle-json').textContent = 'Edit as JSON';
        renderEditor();
        setDirty(true);
      } catch (e) {
        toast('Invalid JSON: ' + e.message, true);
      }
    } else {
      jsonMode = true;
      $('#btn-toggle-json').textContent = 'Edit as Form';
      renderJsonEditor();
    }
  }

  async function discardChanges() {
    if (dirty) {
      const ok = await confirmDialog('Discard your unsaved changes?', 'Discard changes');
      if (!ok) return;
    }
    if (currentSection && !toolShown) doOpenSection(currentSection);
    else refreshContent();
  }

  function updateEditorHead() {
    const meta = SECTION_META[currentSection];
    $('#editor-title').textContent = meta ? meta.label : humanLabel(currentSection);
    $('#editor-desc').textContent = meta ? meta.desc : '';
  }

/* ==================== Section metadata ==================== */
  const SECTION_META = {
    personal: { label: 'Personal Info', desc: 'Name, title, bio, location, contact details and portfolio stats.' },
    social: { label: 'Social Links', desc: 'Social media and contact links used across the site.' },
    skills: { label: 'Skills', desc: 'Skill categories with individual proficiency levels and values.' },
    projects: { label: 'Projects', desc: 'Detailed project entries used for cards, filters and detail pages.' },
    liveProjects: { label: 'Live Projects', desc: 'Deployed/live project demos with external links.' },
    certifications: { label: 'Certifications', desc: 'Certifications with issuer, date, category and verification links.' },
    experience: { label: 'Experience', desc: 'Work history and internship timeline entries.' },
    education: { label: 'Education', desc: 'Academic background entries.' },
    achievements: { label: 'Achievements', desc: 'Awards, honors and notable achievements.' },
    services: { label: 'Services', desc: 'Professional services you offer to clients.' },
    testimonials: { label: 'Testimonials', desc: 'Recommendations from clients, supervisors and collaborators.' },
    blogPosts: { label: 'Blog Posts', desc: 'Articles used by the blog listing and article detail pages.' },
    networkingProjects: { label: 'Networking Projects', desc: 'Networking-specific project showcases.' },
    cybersecurityProjects: { label: 'Security Projects', desc: 'Cybersecurity-specific project showcases.' },
    resources: { label: 'Resources', desc: 'Downloads such as the CV and technical documents.' },
    githubRepos: { label: 'GitHub Repos', desc: 'Repositories displayed on the GitHub page.' }
  };

  const TOOL_META = {
    export: { label: 'Export data.js', desc: 'Download the current database as a site-ready js/data.js file — commit it to publish changes to a static host.' },
    backup: { label: 'Download backup', desc: 'Download the full content database as a raw JSON backup file.' },
    reset: { label: 'Reset from data.js', desc: 'Replace the database with the bundled content from js/data.js. All admin edits will be erased.' },
    password: { label: 'Change password', desc: 'Update the admin panel sign-in password.' }
  };

  /* ==================== Navigation ==================== */
  function buildSectionNav() {
    const ul = $('#section-nav');
    ul.innerHTML = '';
    Object.keys(content).forEach(name => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'admin-nav-item';
      btn.dataset.section = name;
      btn.textContent = SECTION_META[name] ? SECTION_META[name].label : humanLabel(name);
      btn.addEventListener('click', () => openSection(name));
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }

  function updateNavActive() {
    $$('#section-nav .admin-nav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.section === currentSection);
    });
    $$('#tool-nav .admin-nav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === toolShown);
    });
  }

  async function refreshContent() {
    try {
      content = await api('/api/content');
      buildSectionNav();
      const first = Object.keys(content)[0] || 'personal';
      doOpenSection(first);
    } catch (e) {
      toast(e.message, true);
    }
  }

  /* ==================== Login / dashboard ==================== */
  function showLogin() {
    $('#view-login').classList.remove('hidden');
    $('#view-dashboard').classList.add('hidden');
  }
  function showDashboard(username) {
    $('#admin-user').textContent = 'Signed in as ' + username;
    $('#view-dashboard').classList.remove('hidden');
    $('#view-login').classList.add('hidden');
    refreshContent();
  }

/* ==================== Tools ==================== */
  async function openTool(name) {
    if (dirty) {
      const ok = await confirmDialog('Your unsaved changes will be lost.', 'Unsaved changes');
      if (!ok) return;
    }
    toolShown = name;
    currentSection = null;
    setDirty(false);
    updateNavActive();
    $('.admin-actions').style.display = 'none';
    const meta = TOOL_META[name];
    $('#editor-title').textContent = meta.label;
    $('#editor-desc').textContent = meta.desc;
    const bodyEl = $('#editor-body');
    bodyEl.innerHTML = '';
    if (name === 'export' || name === 'backup') {
      const href = name === 'export' ? '/api/export' : '/api/backup';
      const file = name === 'export' ? 'data.js' : 'portfolio-backup.json';
      bodyEl.innerHTML =
        '<div class="admin-tool-card admin-card">' +
        '<h2>' + meta.label + '</h2>' +
        '<p>' + meta.desc + '</p>' +
        '<a class="btn btn-primary" href="' + href + '" download="' + file + '">Download ' + file + '</a>' +
        '</div>';
    } else if (name === 'reset') {
      bodyEl.innerHTML =
        '<div class="admin-tool-card admin-card">' +
        '<h2>Reset content database</h2>' +
        '<p>' + meta.desc + '</p>' +
        '<button class="btn btn-primary" id="reset-btn" type="button">Reset Database</button>' +
        '</div>';
      $('#reset-btn').addEventListener('click', async () => {
        const ok = await confirmDialog('This erases ALL admin edits and restores the content bundled in js/data.js. Continue?', 'Reset database');
        if (!ok) return;
        try {
          const res = await api('/api/reset', 'POST', {});
          content = res.value;
          buildSectionNav();
          doOpenSection(Object.keys(content)[0]);
          toast('Database reset to bundled content');
        } catch (e) { toast(e.message, true); }
      });
    } else if (name === 'password') {
      bodyEl.innerHTML =
        '<div class="admin-tool-card admin-card">' +
        '<h2>Change admin password</h2>' +
        '<form id="password-form" novalidate>' +
        '<div class="form-group"><label class="form-label" for="pw-current">Current password</label>' +
        '<input type="password" class="form-control" id="pw-current" autocomplete="current-password" required></div>' +
        '<div class="form-group"><label class="form-label" for="pw-new">New password (min 8 chars)</label>' +
        '<input type="password" class="form-control" id="pw-new" autocomplete="new-password" required></div>' +
        '<div class="form-group"><label class="form-label" for="pw-confirm">Confirm new password</label>' +
        '<input type="password" class="form-control" id="pw-confirm" autocomplete="new-password" required></div>' +
        '<div class="form-error" id="pw-error" hidden></div>' +
        '<button class="btn btn-primary" type="submit">Update Password</button>' +
        '</form></div>';
      $('#password-form').addEventListener('submit', async e => {
        e.preventDefault();
        const current = $('#pw-current').value;
        const next = $('#pw-new').value;
        const confirmPw = $('#pw-confirm').value;
        const errEl = $('#pw-error');
        errEl.hidden = true;
        if (next.length < 8) { errEl.textContent = 'New password must be at least 8 characters.'; errEl.hidden = false; return; }
        if (next !== confirmPw) { errEl.textContent = 'New password and confirmation do not match.'; errEl.hidden = false; return; }
        try {
          await api('/api/auth/password', 'POST', { currentPassword: current, newPassword: next });
          $('#pw-current').value = $('#pw-new').value = $('#pw-confirm').value = '';
          toast('Password updated');
        } catch (err) {
          errEl.textContent = err.message;
          errEl.hidden = false;
        }
      });
    }
  }

  /* ==================== Init ==================== */
  function init() {
    $('#login-form').addEventListener('submit', async e => {
      e.preventDefault();
      const username = $('#login-username').value.trim();
      const password = $('#login-password').value;
      const errEl = $('#login-error');
      errEl.hidden = true;
      $('#login-submit').disabled = true;
      try {
        const res = await api('/api/auth/login', 'POST', { username, password });
        showDashboard(res.username);
        $('#login-password').value = '';
      } catch (err) {
        errEl.textContent = err.message;
        errEl.hidden = false;
      } finally {
        $('#login-submit').disabled = false;
      }
    });

    $('#btn-logout').addEventListener('click', async () => {
      try { await api('/api/auth/logout', 'POST', {}); } catch (e) { /* ignore */ }
      showLogin();
    });

    $('#btn-save').addEventListener('click', saveSection);
    $('#btn-discard').addEventListener('click', discardChanges);
    $('#btn-toggle-json').addEventListener('click', toggleJsonMode);

    $$('#tool-nav .admin-nav-item').forEach(btn => {
      btn.addEventListener('click', () => openTool(btn.dataset.tool));
    });

    window.addEventListener('beforeunload', e => {
      if (dirty) { e.preventDefault(); e.returnValue = ''; }
    });

    api('/api/auth/me')
      .then(res => showDashboard(res.username))
      .catch(() => showLogin());
  }

  document.addEventListener('DOMContentLoaded', init);
})();