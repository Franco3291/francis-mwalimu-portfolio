'use strict';
/* ============================================================================
   set-domain.js — replace the placeholder example.com domain (or a previously
   deployed domain) with the new live domain across the static site files
   (canonical URLs, Open Graph tags, sitemap.xml and the live-project URL in
   js/data.js).

   Usage:   node server/scripts/set-domain.js <new-base-url> [old-base-url]

   Example: node server/scripts/set-domain.js https://project.onrender.com

   By default the placeholder host "francis-mwalimu-portfolio.example.com" is
   replaced in any .html / .js / .xml / .txt / .json / .css / .md file under the
   repo (skipping .git, node_modules, backups and uploads). The script never
   edits its own source, so it stays a reusable one-shot tool and re-running
   with the same URL is a no-op. To migrate from a previously deployed host,
   pass it as the second argument:
     node server/scripts/set-domain.js https://new.example.com https://old.onrender.com
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const PLACEHOLDER_HOST = 'francis-mwalimu-portfolio.example.com';
const SELF = path.relative(ROOT, __filename); // this file is never edited

const newArg = process.argv[2];
if (!newArg) {
  console.error('Usage: node server/scripts/set-domain.js <new-base-url> [old-base-url]');
  console.error('Example: node server/scripts/set-domain.js https://project.onrender.com');
  process.exit(1);
}
const newBase = String(newArg).trim().replace(/\/+$/, '');
if (!/^https?:\/\/[^/\s]+$/i.test(newBase)) {
  console.error('Invalid base URL: "' + newBase + '" — use e.g. https://project.onrender.com');
  process.exit(1);
}
const newHost = newBase.replace(/^https?:\/\//i, '');
if (!newHost.includes('.')) {
  console.error('The host "' + newHost + '" does not look like a real domain.');
  process.exit(1);
}

// Optional second argument migrates from a previously deployed host.
// Without it the placeholder host is replaced.
let oldHost = PLACEHOLDER_HOST;
const oldArg = process.argv[3];
if (oldArg) {
  const old = String(oldArg).trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[^/\s]+$/i.test(old)) {
    console.error('Invalid old base URL: "' + old + '"');
    process.exit(1);
  }
  oldHost = old.replace(/^https?:\/\//i, '');
}

const SKIP_DIRS = new Set(['.git', 'node_modules', 'backups', 'uploads']);
const ALLOWED_EXT = new Set(['.html', '.js', '.xml', '.txt', '.json', '.css', '.md']);

const changed = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
      walk(full);
      continue;
    }
    const rel = path.relative(ROOT, full);
    if (rel === SELF) continue; // keep the tool itself a reusable template
    if (!ALLOWED_EXT.has(path.extname(entry.name).toLowerCase())) continue;
    const raw = fs.readFileSync(full, 'utf8');
    if (!raw.includes(oldHost)) continue;
    const next = raw.split(oldHost).join(newHost);
    if (next === raw) continue; // no actual change -> truly idempotent
    fs.writeFileSync(full, next, 'utf8');
    changed.push(rel);
  }
}

walk(ROOT);

if (!changed.length) {
  console.log('No "' + oldHost + '" references found — the domain is already set.');
} else {
  console.log('Replaced "' + oldHost + '" with: ' + newBase);
  console.log('Updated ' + changed.length + ' file(s):');
  changed.forEach(f => console.log('  ' + f));
  console.log('Remember to commit and push if you want the change deployed.');
}