# Francis Mwalimu Portfolio

## Local preview

This is a static HTML, CSS and JavaScript portfolio. Serve the folder with any static web server so query-string detail pages work consistently. For example, use VS Code Live Server or a hosting preview environment.

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

The site can be deployed to GitHub Pages, Netlify, Cloudflare Pages, Vercel static hosting or any HTTPS web server. Configure the host to serve `index.html` at the root, preserve query strings for `project.html?id=...` and `article.html?id=...`, and enable HTTPS.

## Maintenance

- Add projects and certifications to `js/data.js`; the cards, filters and detail views update automatically.
- Keep `sitemap.xml` current when adding indexable pages.
- Keep public downloads limited to approved documents with no private data.
- Use privacy-preserving, aggregate analytics only. A private analytics dashboard requires a server-side analytics provider or authenticated backend; this static frontend intentionally does not expose one.

## Validation checklist

- Check all local links and assets after adding files.
- Test keyboard navigation, reduced-motion preferences, mobile navigation, light/dark themes and contact validation.
- Test on a clean HTTPS deployment before sharing the URL.
