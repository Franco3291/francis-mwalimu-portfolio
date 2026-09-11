# Francis Mwalimu — Portfolio

A modern, static, dependency‑free portfolio website for **Francis Mwalimu**, an IT professional specializing in **networking, cybersecurity, software development, web & mobile development, databases, system administration, and technical support**.

Built with plain HTML, CSS, and JavaScript — no frameworks, no build step, no package manager. All content is centralized in a single data file, so the entire site is easy to preview, host, and maintain.

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

---

## 🧱 Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Markup   | Semantic HTML5                          |
| Styling  | CSS3 with custom properties (variables) |
| Scripting| Vanilla JavaScript (ES6+)               |
| Fonts    | Google Fonts — Inter & JetBrains Mono   |
| Icons    | Emoji + inline SVG                      |

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
├── css/
│   └── style.css           # Single stylesheet (light/dark themes)
├── js/
│   ├── data.js             # ALL site content (PORTFOLIO_DATA)
│   └── main.js             # Rendering, theme, nav, filters, forms
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

To update the site, edit the relevant section in `js/data.js` — the rendering code in `js/main.js` picks it up automatically with no other changes needed.

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

## 🌐 Deployment

The site runs on any static/HTTPS hosting platform:

- **GitHub Pages**
- **Netlify**
- **Vercel** (static hosting)
- **Cloudflare Pages**
- Any HTTPS web server

### Requirements

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

- **Content:** edit `js/data.js` only — cards, filters, and detail pages render automatically.
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