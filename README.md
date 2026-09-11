# Francis Mwalimu — Portfolio

A modern, static, dependency‑free portfolio website for **Francis Mwalimu**, an IT professional specializing in **networking, cybersecurity, software development, web & mobile development, databases, system administration, and technical support**.

Built with plain HTML, CSS, and JavaScript — no frameworks, no build step, no package manager. All content is centralized in a single data file (and can also be managed live through the included **Node.js admin panel**), so the entire site is easy to preview, host, and maintain.

> **Status:** Template with placeholder content. Review the [Before deployment](#-before-deployment-checklist) section before publishing.

---

## ✨ Features

- **Fully static & fast** — plain HTML/CSS/JS with zero dependencies and no build tools required.
- **Centralized content** — every project, skill, certification, blog post, and more lives in `js/data.js`; cards, filters, and detail pages update automatically.
- **Light / dark theme** — toggleable with icon switch; remembers the user's choice in `localStorage` and respects the OS `prefers-color-scheme` setting.
- **Responsive navigation** — mobile hamburger menu, sticky header with scroll state, and skip-to-content link for keyboard users.
- **Interactive elements** — scroll‑reveal animations, back‑to‑top button, searchable/filterable project & certification grids, animated loading overlay.
- **Detail pages via query strings** — individual project and article pages rendered from `id` parameters (`project.html?id=...`, `article.html?id=...`).
- **Contact & feedback forms** — client‑side validation plus a honeypot field for spam protection. Falls back to `mailto:` when no backend endpoint is configured.
- **SEO & social ready** — per‑page meta tags, Open Graph, Twitter cards, JSON‑LD structured data, `sitemap.xml`, and `robots.txt`.
- **Accessibility** — semantic markup, ARIA labels, keyboard navigation, visible focus states, and support for `prefers-reduced-motion`.
- **GitHub integration** — a dedicated page that showcases selected repositories and open‑source work.
- **Admin panel** — a password‑protected Node.js backend (`/admin.html`) with a form & JSON editor for every content section, backups, reset, and one-click export of the static `data.js`.

---

## 🧱 Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Markup   | Semantic HTML5                          |
| Styling  | CSS3 with custom properties (variables) |
| Scripting| Vanilla JavaScript (ES6+)               |
| Fonts    | Google Fonts — Inter & JetBrains Mono   |
| Icons    | Emoji + inline SVG                      |
| Backend  | Node.js zero‑dependency HTTP server (optional, enables the admin panel) |

No external JavaScript libraries or runtime dependencies are required.

---

## 📁 Project Structure

```
francis-mwalimu-portfolio/
├── index.html              # Home page
├── about.html              # Bio, strengths & interests
├── skills.html             # Skill categories & proficiency bars
├── projects.html           # All projects (filterable)
├── project.html            # Project detail page  (?id=...)
├── live-projects.html      # Live/deployed project demos
├── certifications.html     # Certifications (filterable)
├── networking.html         # Networking projects
├── cybersecurity.html      # Cybersecurity projects
├── experience.html         # Work experience & timeline
├── services.html           # Services offered
├── testimonials.html       # Client & collaborator feedback
├── blog.html               # Articles listing
├── article.html            # Article detail page  (?id=...)
├── github.html             # GitHub repositories showcase
├── resources.html          # CV & downloadable documents
├── contact.html            # Contact info + form
├── feedback.html           # Private feedback form  (noindex)
├── privacy.html            # Privacy statement        (noindex)
├── admin.html              # Admin panel (password-protected, noindex)
├── admin.css               # Admin panel styles
├── css/
│   └── style.css           # Single stylesheet (light/dark themes)
├── js/
│   ├── data.js             # ALL bundled site content (PORTFOLIO_DATA)
│   ├── main.js             # Rendering, theme, nav, filters, forms
│   └── admin.js            # Admin panel application logic
├── server/
│   ├── server.js           # Node backend: static site + admin API
│   ├── users.js            # Admin credentials (scrypt hash)
│   ├── db.js               # JSON content database helpers
│   ├── data/
│   │   └── content.json    # Live content database (managed via admin)
│   └── scripts/
│       ├── init-data.js    # Extract js/data.js -> content.json
│       ├── set-password.js # Set/change the admin password
│       └── smoke-test.js   # API smoke tests
├── assets/
│   └── images/             # Profile photo, OG image, etc.
├── docs/
│   └── SETUP.md            # Detailed setup & deployment notes
├── robots.txt              # Crawler rules + sitemap reference
└── sitemap.xml             # XML sitemap for search engines
```

---

## 🚀 Getting Started

No build step or installation is required. Serve the folder with **any static web server** so the query‑string detail pages (`project.html?id=...`, `article.html?id=...`) work consistently.

### Option 1 — VS Code Live Server (recommended)

1. Open the project folder in VS Code.
2. Install the **Live Server** extension.
3. Right‑click `index.html` → **Open with Live Server**.

### Option 2 — Python

```bash
# From the project root
python -m http.server 8000
```

Then open `http://localhost:8000`.

### Option 3 — Node.js

```bash
npx serve .
```

### Option 4 — Node.js backend with admin panel

If you want the admin panel, run the included zero‑dependency Node server (it serves the whole site AND the content API):

```bash
node server/server.js          # or: npm start
```

Then open:
- Public site: `http://localhost:3000/`
- Admin panel: `http://localhost:3000/admin.html`

> **Tip:** Avoid opening `index.html` directly via `file://` — some features (such as dynamic detail pages and asset paths) rely on being served over HTTP.

---

## ⚙️ Configuration

All site content is maintained in a single file: **`js/data.js`** — a global `PORTFOLIO_DATA` object with the following sections:

| Key                    | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `personal`             | Name, title, bio, location, email, phone, photo, CV path, stats |
| `social`               | GitHub, LinkedIn, X/Twitter, WhatsApp, email links |
| `skills`               | Categorized skills with proficiency levels     |
| `projects`             | Project cards & detail content                 |
| `liveProjects`         | Deployed/live project demos                    |
| `certifications`       | Certifications with categories & credentials   |
| `experience`           | Work history timeline                          |
| `education`            | Academic background                            |
| `achievements`         | Awards & notable achievements                  |
| `services`             | Professional services offered                  |
| `testimonials`         | Client/supervisor recommendations              |
| `blogPosts`            | Articles (listing + full detail content)       |
| `networkingProjects`   | Networking-specific projects                   |
| `cybersecurityProjects`| Security-specific projects                     |
| `resources`            | CV, technical documents & downloads            |
| `githubRepos`          | Repositories shown on the GitHub page          |

To update the site, edit the relevant section in `js/data.js` — or use the admin panel, which writes to `server/data/content.json` instead. The rendering code in `js/main.js` picks up either source automatically (it loads `/api/content` when the Node backend is serving the site, otherwise falls back to the bundled `data.js`).

---

## 📝 Contact & Feedback Forms

- **Contact form** (`contact.html`) and **feedback form** (`feedback.html`) validate input in the browser and include a hidden **honeypot field** to deter spam bots.
- If `personal.contactFormEndpoint` in `js/data.js` is empty, the forms open the visitor's email client via a `mailto:` link.
- For production delivery, set `contactFormEndpoint` to a trusted HTTPS form provider (or your own server endpoint) that:
  - Validates input server-side
  - Rate-limits requests
  - Rejects honeypot submissions
  - Sanitizes/screens content
  - Sends mail **without exposing API keys or credentials to the browser**

---

## 🛠️ Admin Panel

A password‑protected admin panel at **`/admin.html`** lets you manage all portfolio content through a built‑in Node.js backend — no more editing JavaScript by hand.

### Quick start

```bash
# 1. Extract the bundled content into the JSON database (first run only)
node server/scripts/init-data.js

# 2. Create your admin account (stores only a scrypt password hash)
node server/scripts/set-password.js   # or: npm run set-password

# 3. Start the server
node server/server.js                 # or: npm start
```

Open `http://localhost:3000/admin.html` and sign in.

> ⚠️ `server/config.json` (containing your password hash) is git‑ignored — never commit it. `server/data/content.json` is the live database and should be backed up regularly (there's a built‑in backup download).

### What you can do

- **Edit every section** — personal info, socials, skills, projects, live projects, certifications, experience, education, achievements, services, testimonials, blog posts, networking, security, resources and GitHub repos — with friendly generated forms (add/remove/reorder items, or switch to JSON mode for power editing).
- **Export `data.js`** — download the current database as a site‑ready `js/data.js` file to commit for static hosting.
- **Download backup** — a raw JSON snapshot of the database.
- **Reset** — restore the database from the bundled `js/data.js`.
- **Change password** — right from the panel, no CLI needed.

### API overview

| Method | Route | Description |
| ------ | ----- | ----------- |
| GET | `/api/health` | Health check (public) |
| GET | `/api/content` | Full content (public — used by the site) |
| POST | `/api/auth/login` | Sign in; sets an `HttpOnly` session cookie |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Session check |
| POST | `/api/auth/password` | Change password |
| PUT | `/api/content/:section` | Update one content section |
| PUT | `/api/content` | Replace whole content |
| GET | `/api/export` | Download site‑ready `data.js` |
| GET | `/api/backup` | Download JSON backup |
| POST | `/api/reset` | Restore from bundled `data.js` |

All write routes require a valid admin session. Login attempts are rate‑limited (5 tries / 15 minutes) and request bodies are size‑limited (3 MB).

### Frontend behaviour

When the site is served by the Node backend, `js/main.js` loads `/api/content` at startup, so admin edits appear on the live site immediately. On a static host (no backend), the bundled `js/data.js` is used — publish changes by exporting and committing the updated file. The admin panel and API are excluded from search engines via `robots.txt` and meta tags.

---

## 🌐 Deployment

### Option A — Static hosting (no admin panel)

The static site runs anywhere:

- **GitHub Pages**
- **Netlify**
- **Vercel** (static hosting)
- **Cloudflare Pages**
- Any HTTPS web server

To publish admin edits on a static host, use **Export data.js** in the panel and commit the downloaded file over `js/data.js`.

### Option B — Node.js host (full admin panel)

For the live admin panel, deploy `server/server.js` to a Node‑capable platform such as **Render**, **Railway**, **Fly.io**, **Glitch**, or any VPS (`npm start`). The server serves both the site and the API, so admin edits appear instantly. Set `secureCookies: true` in `server/config.json` when serving over HTTPS.

### Requirements (both options)

1. Serve `index.html` at the root.
2. **Preserve query strings** so detail pages work (`project.html?id=...`, `article.html?id=...`).
3. Enable **HTTPS**.
4. Replace the placeholder `example.com` domain everywhere before going live (see checklist below).

### Example — GitHub Pages

```bash
# Commit and push the repository, then:
# 1. Repo Settings → Pages
# 2. Source: Deploy from a branch
# 3. Branch: main, folder: / (root)
```

---

## 🔍 SEO & Accessibility

- **SEO:** unique titles/descriptions per page, semantic HTML, canonical URLs, Open Graph + Twitter Card meta, JSON‑LD `Person` structured data, `sitemap.xml`, and `robots.txt`.
- **Accessibility:** skip links, ARIA labels, keyboard‑friendly navigation, focus styles, contrast‑checked themes, and `prefers-reduced-motion` support.

---

## 🧹 Maintenance

- **Content:** edit `js/data.js`, or use the admin panel (which writes to `server/data/content.json`) — cards, filters, and detail pages render automatically. Run `node server/scripts/init-data.js` after you change `js/data.js` to refresh the database copy.
- **Backups:** regularly download a backup from the admin panel (or copy `server/data/content.json`) — it's the live database on the Node host.
- **Sitemap:** update `sitemap.xml` when adding indexable pages.
- **Downloads:** keep public downloads limited to approved documents; never host private files.
- **Analytics:** prefer privacy‑preserving, aggregate analytics only. This static frontend intentionally does not include a client‑side analytics dashboard or credentials.
- **Privacy policy:** keep the statements in `privacy.html` consistent with any third‑party services you add.

---

## ✅ Before Deployment Checklist

- [ ] Replace placeholder contact fields (email, phone, WhatsApp), social URLs, profile photo, and CV path in `js/data.js`.
- [ ] Replace clearly marked placeholder education, experience, certification, testimonial, and project content.
- [ ] Add approved files under `assets/docs/` and images under `assets/images/`.
- [ ] Replace `example.com` with your real HTTPS domain in page metadata, `robots.txt`, `sitemap.xml`, and live‑project data.
- [ ] Set `personal.contactFormEndpoint` to a trusted HTTPS form provider or your own server endpoint.
- [ ] Set a strong admin password (`node server/scripts/set-password.js`) and never commit `server/config.json`.
- [ ] Run `node server/scripts/init-data.js` so the database matches the final `js/data.js`.
- [ ] Replace placeholder verification URLs and credential IDs on certifications.
- [ ] Test all local links and assets after adding files.
- [ ] Test keyboard navigation, reduced‑motion preference, mobile navigation, light/dark themes, and form validation.
- [ ] Test on a clean HTTPS deployment before sharing the URL.

---

## 📄 License

This project is provided as a personal template/portfolio. Content owned by Francis Mwalimu is not licensed for commercial reuse without permission.

---

## ⭐ Support

If you find this template useful, consider starring the repo on GitHub: [github.com/Franco3291/francis-mwalimu-portfolio](https://github.com/Franco3291/francis-mwalimu-portfolio)

Issues, suggestions, and pull requests are welcome.