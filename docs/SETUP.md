# Francis Mwalimu Portfolio

## Local preview

This is a static HTML, CSS and JavaScript portfolio. Serve the folder with any static web server so query-string detail pages work consistently. For example, use VS Code Live Server or a hosting preview environment.

## Admin panel (Node.js backend)

The project includes a password-protected admin panel (`/admin.html`) backed by a zero-dependency Node.js server. It serves the site **and** a JSON content API:

```bash
# 1. Extract the bundled content into the JSON database (first run only)
node server/scripts/init-data.js

# 2. Create your admin account (stores only a scrypt password hash)
node server/scripts/set-password.js   # or: npm run set-password

# 3. Start the server (site + admin API)
node server/server.js                 # or: npm start
```

Open `http://localhost:3000/admin.html`, sign in, and manage all content sections in friendly generated forms (or JSON mode). Changes are written to `server/data/content.json` and appear on the live site immediately.

- `server/config.json` holds the username and password hash. It is **git-ignored** — never commit it.
- `server/data/content.json` is the live content database. **Every save is automatically backed up** to `server/data/backups/` (latest 20 kept, atomic write + rotation) — manage snapshots under **Admin → Backups & restore**, or download the raw JSON with `GET /api/backup`.
- Run **`npm test`** to run both suites: the API smoke test and the end-to-end feature test. Individually: `node server/scripts/smoke-test.js` (against a running server) and `node server/scripts/feature-test.js` (start its own server plus a fake SMTP inbox, and also covers sitemap/feed, caching, backups and the broken-link checker).
- The server also exposes a dynamic `sitemap.xml`, an Atom `feed.xml`, graceful shutdown (SIGINT/SIGTERM), security headers (CSP, nosniff, frame/host policy) and gzip + ETag caching on static assets.
- Reset the database to the bundled `js/data.js` any time from the panel, or with `node server/scripts/init-data.js --force`.

### File uploads

- The **Uploads** tool in the panel attaches images (PNG/JPEG/GIF/WebP), MP4 video, and PDF files to per-section folders under `assets/uploads/`.
- Files are validated by **magic bytes** (not client MIME types), limited to **60 MB**, and served from `/assets/uploads/...`. Add upload URLs (e.g. a project's `videoUrl` or a certification's `certificateImage`) through the normal section forms.
- `assets/uploads/` is git-ignored and lives on the Node host's disk. On a static host, copy the files you need into the deployed site manually.

### Email delivery (SMTP)

- The server includes a dependency-free SMTP client (`server/email.js`) with STARTTLS support.
- Save your provider's settings under **Admin → Email** (host, port, TLS, username, password) and click **Send test email** to verify. The stored password is masked and never sent back to the browser.
- Once configured, `/api/contact` and `/api/feedback` deliver the site's contact/feedback forms by email — server-side, with a honeypot check and per-sender rate limit (5 messages/hour/IP).

## Before deployment

1. Update personal contact fields, social URLs, profile photo and CV path in `js/data.js`.
2. Replace clearly marked placeholder education, experience, certification, testimonial and project content.
3. Add approved files under `assets/docs/` and images under `assets/images/`.
4. Replace `example.com` in page metadata, `robots.txt`, `sitemap.xml` and live-project data with the real HTTPS domain.
5. Set `personal.contactFormEndpoint` to a trusted HTTPS form provider or your own server endpoint. Never put API keys, secrets or private credentials in frontend files.
6. Replace the placeholder verification URLs and credential IDs before publishing certificates.

## Contact and feedback forms

Without a configured endpoint, the forms open the configured email client using `mailto:`. When the Node backend is running, configure the built-in SMTP delivery under **Admin → Email** (or with `POST /api/email/config`). Submissions are then validated and rate-limited server-side, honeypot submissions are rejected silently, content is sanitized, and mail is sent without exposing credentials to the browser.

## Hosting

**Static hosting (admin panel not live):** deploy to GitHub Pages, Netlify, Cloudflare Pages, Vercel static hosting or any HTTPS web server. To publish admin edits, export `data.js` from the admin panel and commit the downloaded file.

**Node.js host (admin panel live):** deploy `server/server.js` to any Node-capable platform (Render, Railway, Fly.io, Glitch, VPS) with `npm start`. The server serves both the site and the API, so edits appear instantly. Set `secureCookies: true` in `server/config.json` when serving over HTTPS.

In both cases: serve `index.html` at the root, preserve query strings for `project.html?id=...` and `article.html?id=...`, and enable HTTPS.

## Maintenance

- Add projects and certifications via the admin panel (or `js/data.js`); the cards, filters and detail views update automatically.
- After editing `js/data.js` directly, run `node server/scripts/init-data.js` to refresh the database.
- Keep `sitemap.xml` current when adding indexable pages.
- Keep public downloads limited to approved documents with no private data.
- Use privacy-preserving, aggregate analytics only.
- Back up `server/data/content.json` regularly.
- Back up `assets/uploads/` if you use uploaded files — they are stored only on the Node host's disk.

## Validation checklist

- Check all local links and assets after adding files.
- Test keyboard navigation, reduced-motion preferences, mobile navigation, light/dark themes and contact validation.
- Test on a clean HTTPS deployment before sharing the URL.
