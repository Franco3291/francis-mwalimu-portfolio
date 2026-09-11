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
- `server/data/content.json` is the live content database; keep backups (the panel has a backup download).
- Run `node server/scripts/smoke-test.js` against a running server to verify the API.
- Reset the database to the bundled `js/data.js` any time from the panel, or with `node server/scripts/init-data.js --force`.

## Before deployment

1. Update personal contact fields, social URLs, profile photo and CV path in `js/data.js`.
2. Replace clearly marked placeholder education, experience, certification, testimonial and project content.
3. Add approved files under `assets/docs/` and images under `assets/images/`.
4. Replace `example.com` in page metadata, `robots.txt`, `sitemap.xml` and live-project data with the real HTTPS domain.
5. Set `personal.contactFormEndpoint` to a trusted HTTPS form provider or your own server endpoint. Never put API keys, secrets or private credentials in frontend files.
6. Replace the placeholder verification URLs and credential IDs before publishing certificates.

## Contact and feedback forms

Without a configured endpoint, the forms open the configured email client using `mailto:`. For production delivery, configure an HTTPS endpoint that validates input server-side, rate-limits requests, rejects the honeypot field, sanitizes content, and sends mail without exposing credentials to the browser.

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

## Validation checklist

- Check all local links and assets after adding files.
- Test keyboard navigation, reduced-motion preferences, mobile navigation, light/dark themes and contact validation.
- Test on a clean HTTPS deployment before sharing the URL.
