'use strict';
/* ============================================================================
   set-domain.js — replace the placeholder example.com domain with the real
   live domain across the static site files (canonical URLs, Open Graph tags,
   sitemap.xml and the live-project URL in js/data.js).

   Usage:   node server/scripts/set-domain.js <base-url>
   Example: node server/scripts/set-domain.js https://mwalimu-portfolio.onrender.com

   Replaces the placeholder host "francis-mwalimu-portfolio.example.com" in any
   .html / .js / .xml / .txt / .json / .css / .md file under the repo (skipping
   .git, node_modules, backups and uploads). It is idempotent and safe to re-run.
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const PLACEHOLDER = 'francis-mwalimu-portfolio.example.com';

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node server/scripts/set-domain.js <base-url>');
  console.error('Example: node server/scripts/set-domain.js https://mwalimu-portfolio.onrender.com');
  process.exit(1);
}
const base = String(arg).trim().replace(/\/+$/, '');
if (!/^https?:\/\/[^/\s]+$/i.test(base)) {
  console.error('Invalid base URL: "' + base + '" — use e.g. https://mwalimu-portfolio.onrender.com');
  process.exit(1);
}
const host = base.replace(/^https?:\/\//i, '');
if (!host.includes('.')) {
  console.error('The host "' + host + '" does not look like a real domain.');
  process.exit(1);
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
    if (!ALLOWED_EXT.has(path.extname(entry.name).toLowerCase())) continue;
    const raw = fs.readFileSync(full, 'utf8');
    if (!raw.includes(PLACEHOLDER)) continue;
    fs.writeFileSync(full, raw.split(PLACEHOLDER).join(host), 'utf8');
    changed.push(path.relative(ROOT, full));
  }
}

walk(ROOT);

if (!changed.length) {
  console.log('No ' + PLACEHOLDER + ' references found — the domain is already set.');
} else {
  console.log('Replaced the placeholder domain with: ' + base);
  console.log('Updated ' + changed.length + ' file(s):');
  changed.forEach(f => console.log('  ' + f));
  console.log('Remember to commit and push if you want the change deployed.');
}
