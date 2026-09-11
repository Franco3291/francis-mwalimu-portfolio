/* ==========================================================================
   Francis Mwalimu - Portfolio Main JavaScript
   Handles theme, navigation, rendering, filtering, forms and interactions
   ========================================================================== */

(function () {
  'use strict';

  /* ==================== UTILITIES ==================== */
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function isConfiguredLink(url) {
    return Boolean(url) && !/(example\.com|your-|XXXX|000 000|placeholder)/i.test(url);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function debounce(func, wait = 300) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /* ==================== THEME MANAGEMENT ==================== */
  const themeManager = {
    init() {
      const savedTheme = localStorage.getItem('fm-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (prefersDark ? 'dark' : 'light');
      this.setTheme(theme);
      this.updateToggleIcon();
    },

    setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('fm-theme', theme);
      this.updateToggleIcon();
    },

    toggle() {
      const current = document.documentElement.getAttribute('data-theme');
      this.setTheme(current === 'dark' ? 'light' : 'dark');
    },

    updateToggleIcon() {
      const toggle = $('.theme-toggle');
      if (!toggle) return;
      const theme = document.documentElement.getAttribute('data-theme');
      toggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  };

  /* ==================== NAVIGATION ==================== */
  const navManager = {
    init() {
      const toggle = $('.nav-toggle');
      const menu = $('.nav-menu');

      if (toggle && menu) {
        toggle.addEventListener('click', () => {
          const isOpen = menu.classList.toggle('open');
          toggle.setAttribute('aria-expanded', isOpen);
          toggle.innerHTML = isOpen ? '✕' : '☰';
        });

        // Close menu when clicking a link
        $$('.nav-link', menu).forEach(link => {
          link.addEventListener('click', () => {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.innerHTML = '☰';
          });
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
          if (!menu.contains(e.target) && !toggle.contains(e.target) && menu.classList.contains('open')) {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.innerHTML = '☰';
          }
        });

        // Close menu on Escape
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && menu.classList.contains('open')) {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.innerHTML = '☰';
            toggle.focus();
          }
        });
      }

      // Highlight active nav link
      this.setActiveLink();
    },

    setActiveLink() {
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      $$('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
          link.classList.add('active');
        }
      });
    }
  };

  /* ==================== HEADER SCROLL EFFECT ==================== */
  function initHeaderScroll() {
    const header = $('.site-header');
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ==================== BACK TO TOP ==================== */
  function initBackToTop() {
    const btn = $('.back-to-top');
    if (!btn) return;
    const onScroll = () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onScroll();
  }

  /* ==================== REVEAL ON SCROLL ==================== */
  function initReveal() {
    const revealElements = $$('.reveal');
    if (!revealElements.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      revealElements.forEach(el => observer.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('visible'));
    }
  }

  /* ==================== RENDER: SKILLS ==================== */
  function renderSkills() {
    const container = $('#skills-container');
    if (!container || !PORTFOLIO_DATA) return;

    container.innerHTML = PORTFOLIO_DATA.skills.map(skillCategory => `
      <div class="skill-category reveal">
        <div class="skill-category-header">
          <div class="skill-category-icon" aria-hidden="true">${skillCategory.icon}</div>
          <h3>${escapeHtml(skillCategory.category)}</h3>
        </div>
        <div class="skill-tags">
          ${skillCategory.skills.map(skill => `
            <span class="skill-tag" title="Level: ${escapeHtml(skill.level)}">${escapeHtml(skill.name)}</span>
          `).join('')}
        </div>
        <div class="skill-level">
          <div class="skill-level-label">
            <span>Proficiency</span>
            <span>${escapeHtml(skillCategory.skills[0]?.level || '')}</span>
          </div>
          <div class="skill-level-bar">
            <div class="skill-level-fill" style="width: ${Math.max(...skillCategory.skills.map(s => s.levelValue))}%"></div>
          </div>
        </div>
      </div>
    `).join('');

    initReveal();
  }

  /* ==================== RENDER: PROJECTS ==================== */
  function renderProjects(projects = PORTFOLIO_DATA.projects, containerId = 'projects-container') {
    const container = $(`#${containerId}`);
    if (!container) return;

    if (!projects.length) {
      container.innerHTML = `
        <div class="no-results" style="text-align:center; padding: 40px;">
          <p>No projects found matching your criteria.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = projects.map(project => `
      <article class="project-card reveal">
        <div class="project-card-image">
          <div class="project-placeholder" aria-hidden="true">${getProjectIcon(project.category)}</div>
          <span class="project-status ${project.status === 'live' ? 'live' : 'github-only'}">
            ${project.status === 'live' ? '● Live' : 'GitHub'}
          </span>
        </div>
        <div class="project-card-body">
          <div class="project-card-category">${escapeHtml(project.category)}</div>
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.shortDescription)}</p>
          <div class="project-card-tech">
            ${project.technologies.slice(0, 5).map(tech => `<span class="tech-badge">${escapeHtml(tech)}</span>`).join('')}
            ${project.technologies.length > 5 ? `<span class="tech-badge">+${project.technologies.length - 5}</span>` : ''}
          </div>
          <div class="project-card-actions">
            <a href="project.html?id=${encodeURIComponent(project.id)}" class="btn btn-secondary btn-sm">Case Study</a>
            ${project.githubUrl ? `<a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">GitHub</a>` : ''}
            ${project.liveUrl ? `<a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Live Demo</a>` : ''}
          </div>
        </div>
      </article>
    `).join('');

    initReveal();
  }

  function getProjectIcon(category) {
    const icons = {
      'Web Development': '🌐',
      'Mobile Development': '📱',
      'Networking': '🌐',
      'Cybersecurity': '🔒',
      'Python': '🐍',
      'Database': '🗄️'
    };
    return icons[category] || '💻';
  }

  /* ==================== PROJECT FILTERING ==================== */
  function initProjectFilters() {
    const filterBar = $('#project-filters');
    const searchInput = $('#project-search');
    if (!filterBar) return;

    let activeCategory = 'all';
    let searchTerm = '';

    const categories = ['all', ...new Set(PORTFOLIO_DATA.projects.map(p => p.category))];

    filterBar.innerHTML = categories.map(cat => `
      <button class="filter-btn ${cat === 'all' ? 'active' : ''}" data-filter="${cat}">
        ${cat === 'all' ? 'All' : escapeHtml(cat)}
      </button>
    `).join('');

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      activeCategory = btn.dataset.filter;
      $$('.filter-btn', filterBar).forEach(b => b.classList.toggle('active', b === btn));
      applyProjectFilters();
    });

    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        searchTerm = e.target.value.toLowerCase().trim();
        applyProjectFilters();
      }, 300));
    }

    function applyProjectFilters() {
      let filtered = PORTFOLIO_DATA.projects;

      if (activeCategory !== 'all') {
        filtered = filtered.filter(p => p.category === activeCategory);
      }

      if (searchTerm) {
        filtered = filtered.filter(p => {
          const searchable = `${p.title} ${p.description} ${p.technologies.join(' ')} ${p.category}`.toLowerCase();
          return searchable.includes(searchTerm);
        });
      }

      renderProjects(filtered);
    }
  }

  /* ==================== RENDER: LIVE PROJECTS ==================== */
  function renderLiveProjects() {
    const container = $('#live-projects-container');
    if (!container) return;

    const liveProjects = PORTFOLIO_DATA.liveProjects.filter(project => isConfiguredLink(project.url));

    if (!liveProjects.length) {
      container.innerHTML = `
        <div class="no-results" style="text-align:center; padding: 40px;">
          <p>Live projects will appear here as they are deployed.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = liveProjects.map(project => `
      <article class="project-card reveal">
        <div class="project-card-image">
          <div class="project-placeholder" aria-hidden="true">${getProjectIcon(project.category)}</div>
          <span class="project-status live">● Live</span>
        </div>
        <div class="project-card-body">
          <div class="project-card-category">${escapeHtml(project.category)}</div>
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.shortDescription)}</p>
          <div class="project-card-tech">
            ${project.technologies.map(tech => `<span class="tech-badge">${escapeHtml(tech)}</span>`).join('')}
          </div>
          <div class="project-card-actions">
            <a href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Visit Live Site</a>
            ${project.githubUrl ? `<a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Source Code</a>` : ''}
          </div>
        </div>
      </article>
    `).join('');

    initReveal();
  }

  /* ==================== RENDER: CERTIFICATIONS ==================== */
  function renderCertifications(certs = PORTFOLIO_DATA.certifications) {
    const container = $('#certifications-container');
    if (!container) return;

    if (!certs.length) {
      container.innerHTML = `
        <div class="no-results" style="text-align:center; padding: 40px;">
          <p>No certifications found matching your criteria.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = certs.map(cert => `
      <article class="cert-card reveal">
        <div class="cert-card-header">
          <div class="cert-card-icon" aria-hidden="true">${getCertIcon(cert.category)}</div>
          <div>
            <h3>${escapeHtml(cert.title)}</h3>
            <div class="cert-issuer">${escapeHtml(cert.issuer)}</div>
          </div>
        </div>
        <div class="cert-date">📅 ${escapeHtml(cert.date)}</div>
        ${cert.credentialId ? `<div class="cert-credential">ID: ${escapeHtml(cert.credentialId)}</div>` : ''}
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px;">${escapeHtml(cert.description)}</p>
        <div class="cert-card-actions">
          ${isConfiguredLink(cert.verificationUrl) ? `<a href="${escapeHtml(cert.verificationUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">Verify</a>` : ''}
          ${isConfiguredLink(cert.certificateUrl) ? `<a href="${escapeHtml(cert.certificateUrl)}" download class="btn btn-outline btn-sm">Download</a>` : ''}
        </div>
      </article>
    `).join('');

    initReveal();
  }

  function getCertIcon(category) {
    const icons = {
      'Networking': '🌐',
      'Cybersecurity': '🔒',
      'Programming': '💻',
      'Web Development': '🌐',
      'System Administration': '⚙️',
      'Databases': '🗄️',
      'Mobile Development': '📱'
    };
    return icons[category] || '📜';
  }

  /* ==================== CERTIFICATION FILTERING ==================== */
  function initCertFilters() {
    const filterBar = $('#cert-filters');
    const searchInput = $('#cert-search');
    if (!filterBar) return;

    let activeCategory = 'all';
    let searchTerm = '';

    const categories = ['all', ...new Set(PORTFOLIO_DATA.certifications.map(c => c.category))];

    filterBar.innerHTML = categories.map(cat => `
      <button class="filter-btn ${cat === 'all' ? 'active' : ''}" data-filter="${cat}">
        ${cat === 'all' ? 'All' : escapeHtml(cat)}
      </button>
    `).join('');

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      activeCategory = btn.dataset.filter;
      $$('.filter-btn', filterBar).forEach(b => b.classList.toggle('active', b === btn));
      applyCertFilters();
    });

    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        searchTerm = e.target.value.toLowerCase().trim();
        applyCertFilters();
      }, 300));
    }

    function applyCertFilters() {
      let filtered = PORTFOLIO_DATA.certifications;

      if (activeCategory !== 'all') {
        filtered = filtered.filter(c => c.category === activeCategory);
      }

      if (searchTerm) {
        filtered = filtered.filter(c => {
          const searchable = `${c.title} ${c.issuer} ${c.description} ${c.category} ${c.skills.join(' ')}`.toLowerCase();
          return searchable.includes(searchTerm);
        });
      }

      renderCertifications(filtered);
    }
  }

  /* ==================== RENDER: EXPERIENCE ==================== */
  function renderExperience() {
    const container = $('#experience-container');
    if (!container) return;

    container.innerHTML = `
      <div class="timeline">
        ${PORTFOLIO_DATA.experience.map(exp => `
          <div class="timeline-item reveal">
            <div class="timeline-date">${escapeHtml(exp.startDate)} - ${exp.current ? 'Present' : escapeHtml(exp.endDate)}</div>
            <h3>${escapeHtml(exp.title)}</h3>
            <div class="timeline-org">${escapeHtml(exp.organization)} • ${escapeHtml(exp.location)}</div>
            <p>${escapeHtml(exp.description)}</p>
            ${exp.responsibilities && exp.responsibilities.length ? `
              <ul style="list-style: none; padding-left: 0; margin-top: 8px;">
                ${exp.responsibilities.map(r => `
                  <li style="padding: 4px 0; color: var(--text-secondary); font-size: 0.95rem; position: relative; padding-left: 20px;">
                    <span style="position: absolute; left: 0; color: var(--accent);">▸</span>
                    ${escapeHtml(r)}
                  </li>
                `).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;

    initReveal();
  }

  /* ==================== RENDER: EDUCATION ==================== */
  function renderEducation() {
    const container = $('#education-container');
    if (!container) return;

    container.innerHTML = `
      <div class="timeline">
        ${PORTFOLIO_DATA.education.map(edu => `
          <div class="timeline-item reveal">
            <div class="timeline-date">${escapeHtml(edu.startDate)} - ${edu.current ? 'Present' : escapeHtml(edu.endDate)}</div>
            <h3>${escapeHtml(edu.qualification)}</h3>
            <div class="timeline-org">${escapeHtml(edu.institution)}</div>
            <p>${escapeHtml(edu.description)}</p>
            ${edu.coursework && edu.coursework.length ? `
              <h4 style="font-size: 0.95rem; margin-top: 12px; margin-bottom: 8px;">Relevant Coursework:</h4>
              <div class="skill-tags" style="margin-bottom: 12px;">
                ${edu.coursework.map(c => `<span class="skill-tag">${escapeHtml(c)}</span>`).join('')}
              </div>
            ` : ''}
            ${edu.achievements && edu.achievements.length ? `
              <h4 style="font-size: 0.95rem; margin-top: 12px; margin-bottom: 8px;">Achievements:</h4>
              <ul style="list-style: none; padding-left: 0;">
                ${edu.achievements.map(a => `
                  <li style="padding: 4px 0; color: var(--text-secondary); font-size: 0.95rem; position: relative; padding-left: 20px;">
                    <span style="position: absolute; left: 0; color: var(--accent-green);">✓</span>
                    ${escapeHtml(a)}
                  </li>
                `).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;

    initReveal();
  }

  /* ==================== RENDER: ACHIEVEMENTS ==================== */
  function renderAchievements() {
    const container = $('#achievements-container');
    if (!container) return;

    container.innerHTML = `
      <div class="grid grid-3">
        ${PORTFOLIO_DATA.achievements.map(ach => `
          <div class="achievement-card reveal">
            <div class="achievement-icon" aria-hidden="true">${ach.icon}</div>
            <h3>${escapeHtml(ach.title)}</h3>
            <p>${escapeHtml(ach.description)}</p>
            <div style="margin-top: 12px; font-size: 0.85rem; color: var(--accent); font-weight: 600;">${escapeHtml(ach.year)}</div>
          </div>
        `).join('')}
      </div>
    `;

    initReveal();
  }

  /* ==================== RENDER: SERVICES ==================== */
  function renderServices() {
    const container = $('#services-container');
    if (!container) return;

    container.innerHTML = `
      <div class="grid grid-4">
        ${PORTFOLIO_DATA.services.map(service => `
          <div class="service-card reveal">
            <div class="service-icon" aria-hidden="true">${service.icon}</div>
            <h3>${escapeHtml(service.title)}</h3>
            <p>${escapeHtml(service.description)}</p>
            <ul>
              ${service.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    `;

    initReveal();
  }

  /* ==================== RENDER: TESTIMONIALS ==================== */
  function renderTestimonials() {
    const container = $('#testimonials-container');
    if (!container) return;

    container.innerHTML = `
      <div class="grid grid-3">
        ${PORTFOLIO_DATA.testimonials.map(test => `
          <div class="testimonial-card reveal">
            <p class="testimonial-text">"${escapeHtml(test.text)}"</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar" aria-hidden="true">${escapeHtml(test.avatarInitials)}</div>
              <div>
                <h4>${escapeHtml(test.name)}</h4>
                <div class="testimonial-role">${escapeHtml(test.role)}${test.company ? `, ${escapeHtml(test.company)}` : ''}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    initReveal();
  }

  /* ==================== RENDER: BLOG POSTS ==================== */
  function renderBlogPosts() {
    const container = $('#blog-container');
    if (!container) return;

    container.innerHTML = `
      <div class="grid grid-3">
        ${PORTFOLIO_DATA.blogPosts.map(post => `
          <article class="blog-card reveal">
            <div class="blog-card-image">
              <div class="blog-placeholder" aria-hidden="true">${getBlogIcon(post.category)}</div>
            </div>
            <div class="blog-card-body">
              <div class="blog-card-meta">
                <span>${formatDate(post.date)}</span>
                <span>${escapeHtml(post.readTime)}</span>
              </div>
              <h3>${escapeHtml(post.title)}</h3>
              <p>${escapeHtml(post.excerpt)}</p>
              <div class="project-card-tech" style="margin-bottom: 12px;">
                ${post.tags.slice(0, 3).map(tag => `<span class="tech-badge">${escapeHtml(tag)}</span>`).join('')}
              </div>
              <a href="article.html?id=${encodeURIComponent(post.id)}" class="read-more">Read Article →</a>
            </div>
          </article>
        `).join('')}
      </div>
    `;

    initReveal();
  }

  function getBlogIcon(category) {
    const icons = {
      'Networking': '🌐',
      'Cybersecurity': '🔒',
      'Development': '💻',
      'Mobile Development': '📱'
    };
    return icons[category] || '📝';
  }

  /* ==================== DETAIL VIEWS ==================== */
  function renderProjectDetail() {
    const container = $('#project-detail-container');
    if (!container) return;
    const id = new URLSearchParams(window.location.search).get('id');
    const project = PORTFOLIO_DATA.projects.find(item => item.id === id);

    if (!project) {
      container.innerHTML = '<section class="section"><div class="container"><div class="empty-state"><h1>Project not found</h1><p>The requested case study is not available.</p><a class="btn btn-primary" href="projects.html">Back to projects</a></div></div></section>';
      return;
    }

    const list = items => items && items.length ? `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '<p class="card-text">Details will be added as this project is documented further.</p>';
    container.innerHTML = `
      <section class="case-study-header"><div class="container"><div class="project-card-category">${escapeHtml(project.category)}</div><h1>${escapeHtml(project.title)}</h1><p>${escapeHtml(project.shortDescription)}</p></div></section>
      <nav class="breadcrumbs" aria-label="Breadcrumb"><div class="container"><ol><li><a href="index.html">Home</a></li><li><a href="projects.html">Projects</a></li><li class="current">${escapeHtml(project.title)}</li></ol></div></nav>
      <section class="section"><div class="container case-study-content">
        <div class="card"><h2>Overview</h2><p>${escapeHtml(project.description)}</p><h2>Problem</h2><p>${escapeHtml(project.problem)}</p><h2>Objectives</h2>${list(project.objectives)}<h2>Approach & Role</h2><p>${escapeHtml(project.role)}</p></div>
        <div class="card"><h2>Technologies</h2><div class="project-card-tech">${project.technologiesUsed.map(item => `<span class="tech-badge">${escapeHtml(item)}</span>`).join('')}</div><h2>Major Features</h2>${list(project.features)}</div>
        <div class="card"><h2>Challenges</h2>${list(project.challenges)}<h2>Solutions</h2>${list(project.solutions)}<h2>Results</h2><p>${escapeHtml(project.results)}</p></div>
        <div class="card"><h2>Project Links</h2><div class="project-card-actions">${project.githubUrl ? `<a class="btn btn-outline" href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer">GitHub Repository</a>` : ''}${project.liveUrl ? `<a class="btn btn-primary" href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer">Live Demonstration</a>` : ''}${project.documentationUrl ? `<a class="btn btn-secondary" href="${escapeHtml(project.documentationUrl)}" target="_blank" rel="noopener noreferrer">Documentation</a>` : ''}</div></div>
      </div></section>`;
  }

  function renderArticleDetail() {
    const container = $('#article-detail-container');
    if (!container) return;
    const id = new URLSearchParams(window.location.search).get('id');
    const post = PORTFOLIO_DATA.blogPosts.find(item => item.id === id);
    if (!post) {
      container.innerHTML = '<section class="section"><div class="container"><div class="empty-state"><h1>Article not found</h1><p>The requested article is not available.</p><a class="btn btn-primary" href="blog.html">Back to articles</a></div></div></section>';
      return;
    }
    container.innerHTML = `<section class="case-study-header"><div class="container"><div class="project-card-category">${escapeHtml(post.category)}</div><h1>${escapeHtml(post.title)}</h1><p>${formatDate(post.date)} · ${escapeHtml(post.readTime)}</p></div></section><section class="section"><article class="container article-content"><div class="card"><p>${escapeHtml(post.excerpt)}</p><h2>Article notes</h2><p>${post.content === 'placeholder' ? 'This article is a planned knowledge-sharing piece. Replace this placeholder with the approved article body before publishing.' : escapeHtml(post.content)}</p><div class="project-card-tech">${post.tags.map(tag => `<span class="tech-badge">${escapeHtml(tag)}</span>`).join('')}</div><a class="btn btn-secondary" href="blog.html">Back to articles</a></div></article></section>`;
  }

  /* ==================== RENDER: NETWORKING PORTFOLIO ==================== */
  function renderNetworking() {
    const container = $('#networking-container');
    if (!container) return;

    container.innerHTML = `
      <div class="security-notice">
        <span class="notice-icon" aria-hidden="true">🔒</span>
        <p>All networking projects are simulations created in Cisco Packet Tracer for educational purposes. No production network credentials or sensitive configurations are exposed.</p>
      </div>
      <div class="grid grid-3">
        ${PORTFOLIO_DATA.networkingProjects.map(project => `
          <div class="lab-card reveal">
            <div class="lab-card-header">
              <div class="lab-type">${escapeHtml(project.type)}</div>
              <h3>${escapeHtml(project.title)}</h3>
            </div>
            <div class="lab-card-body">
              <p>${escapeHtml(project.description)}</p>
              <div class="lab-tags">
                ${project.tags.map(tag => `<span class="tech-badge">${escapeHtml(tag)}</span>`).join('')}
              </div>
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">Year: ${escapeHtml(project.year)}</div>
              <div class="lab-actions">
                ${isConfiguredLink(project.fileUrl) ? `<a href="${escapeHtml(project.fileUrl)}" download class="btn btn-secondary btn-sm">Download File</a>` : ''}
                ${isConfiguredLink(project.documentationUrl) ? `<a href="${escapeHtml(project.documentationUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Documentation</a>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    initReveal();
  }

  /* ==================== RENDER: CYBERSECURITY PORTFOLIO ==================== */
  function renderCybersecurity() {
    const container = $('#cybersecurity-container');
    if (!container) return;

    container.innerHTML = `
      <div class="security-notice">
        <span class="notice-icon" aria-hidden="true">🛡️</span>
        <p>All cybersecurity work is performed in controlled, isolated lab environments for educational purposes only. No passwords, API keys, private credentials or sensitive production information are ever exposed.</p>
      </div>
      <div class="grid grid-3">
        ${PORTFOLIO_DATA.cybersecurityProjects.map(project => `
          <div class="lab-card reveal">
            <div class="lab-card-header">
              <div class="lab-type">${escapeHtml(project.type)}</div>
              <h3>${escapeHtml(project.title)}</h3>
            </div>
            <div class="lab-card-body">
              <p>${escapeHtml(project.description)}</p>
              <div class="lab-tags">
                ${project.tags.map(tag => `<span class="tech-badge">${escapeHtml(tag)}</span>`).join('')}
              </div>
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">Year: ${escapeHtml(project.year)}</div>
              <div class="lab-actions">
                ${isConfiguredLink(project.writeupUrl) ? `<a href="${escapeHtml(project.writeupUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">Read Write-up</a>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    initReveal();
  }

  /* ==================== RENDER: GITHUB REPOS ==================== */
  function renderGitHubRepos() {
    const container = $('#github-repos-container');
    if (!container) return;

    container.innerHTML = `
      <div class="grid grid-3">
        ${PORTFOLIO_DATA.githubRepos.map(repo => `
          <div class="card reveal" style="display: flex; flex-direction: column; height: 100%;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 1.2rem;" aria-hidden="true">📦</span>
              <h3 style="font-size: 1rem; margin-bottom: 0; word-break: break-all;">${escapeHtml(repo.name)}</h3>
            </div>
            <p class="card-text" style="flex: 1;">${escapeHtml(repo.description)}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span class="tech-badge">${escapeHtml(repo.language)}</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">
                ⭐ ${repo.stars} &nbsp; 🍴 ${repo.forks}
              </span>
            </div>
            <a href="${escapeHtml(repo.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">View Repository</a>
          </div>
        `).join('')}
      </div>
    `;

    initReveal();
  }

  /* ==================== RENDER: RESOURCES ==================== */
  function renderResources() {
    const container = $('#resources-container');
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.resources.map(resource => `
      <div class="resource-card reveal">
        <div class="resource-icon" aria-hidden="true">${resource.icon}</div>
        <div class="resource-info">
          <h4>${escapeHtml(resource.title)}</h4>
          <p>${escapeHtml(resource.description)}</p>
          <span class="tech-badge" style="display: inline-block; margin-top: 4px;">${escapeHtml(resource.type)}</span>
        </div>
        ${isConfiguredLink(resource.url) ? `<a href="${escapeHtml(resource.url)}" download class="resource-download">Download ↓</a>` : '<span class="tech-badge">File pending</span>'}
      </div>
    `).join('');

    initReveal();
  }

  /* ==================== RENDER: STATS ==================== */
  function renderStats() {
    const container = $('#stats-container');
    if (!container) return;

    const stats = [
      { number: PORTFOLIO_DATA.personal.stats.projects, label: 'Projects Completed' },
      { number: PORTFOLIO_DATA.personal.stats.certifications, label: 'Certifications' },
      { number: PORTFOLIO_DATA.personal.stats.yearsExperience, label: 'Years Experience' },
      { number: PORTFOLIO_DATA.personal.stats.technologies, label: 'Technologies' }
    ];

    container.innerHTML = stats.map(stat => `
      <div class="stat-card reveal">
        <span class="stat-number">${stat.number}+</span>
        <span class="stat-label">${escapeHtml(stat.label)}</span>
      </div>
    `).join('');

    initReveal();
  }

  /* ==================== RENDER: HERO ==================== */
  function renderHero() {
    const hero = $('#hero-content');
    if (!hero) return;

    const p = PORTFOLIO_DATA.personal;

    hero.innerHTML = `
      <h1 class="animate-fade-in-up">Hi, I'm <span class="hero-name">${escapeHtml(p.name)}</span></h1>
      <div class="hero-title animate-fade-in-up animation-delay-1">${escapeHtml(p.title)}</div>
      <p class="hero-description animate-fade-in-up animation-delay-2">${escapeHtml(p.bio)}</p>
      <div class="hero-badges animate-fade-in-up animation-delay-3">
        <span class="hero-badge">🌐 Networking</span>
        <span class="hero-badge">🔒 Cybersecurity</span>
        <span class="hero-badge">💻 Software Development</span>
        <span class="hero-badge">📱 Mobile Development</span>
        <span class="hero-badge">🗄️ Databases</span>
      </div>
      <div class="hero-cta animate-fade-in-up animation-delay-4">
        <a href="projects.html" class="btn btn-primary">View Projects</a>
        <a href="certifications.html" class="btn btn-outline">View Certifications</a>
        <a href="${escapeHtml(p.cvUrl)}" download class="btn btn-outline">Download CV</a>
        <a href="contact.html" class="btn btn-outline">Contact Me</a>
      </div>
    `;

    // Hero image
    const heroImage = $('#hero-image');
    if (heroImage) {
      heroImage.innerHTML = `
        <div class="hero-image-wrapper animate-fade-in">
          <img src="${escapeHtml(p.profileImage)}" alt="Portrait of ${escapeHtml(p.name)}, ${escapeHtml(p.shortTitle)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="hero-image-placeholder" style="display: none;">${escapeHtml(p.firstName.charAt(0))}${escapeHtml(p.lastName.charAt(0))}</div>
        </div>
      `;
    }

    // Hero stats
    const heroStats = $('#hero-stats');
    if (heroStats) {
      heroStats.innerHTML = `
        <div class="hero-stat">
          <span class="stat-number">${p.stats.projects}+</span>
          <span class="stat-label">Projects</span>
        </div>
        <div class="hero-stat">
          <span class="stat-number">${p.stats.certifications}+</span>
          <span class="stat-label">Certifications</span>
        </div>
        <div class="hero-stat">
          <span class="stat-number">${p.stats.yearsExperience}+</span>
          <span class="stat-label">Years Experience</span>
        </div>
      `;
    }
  }

  /* ==================== RENDER: ABOUT ==================== */
  function renderAbout() {
    const container = $('#about-content');
    if (!container) return;

    const p = PORTFOLIO_DATA.personal;

    container.innerHTML = `
      <div class="grid grid-2" style="gap: 40px;">
        <div>
          <h2>About Me</h2>
          <p>${escapeHtml(p.longBio)}</p>
          <h3 style="margin-top: 24px;">Career Objective</h3>
          <p>${escapeHtml(p.careerObjective)}</p>
          <div class="hero-cta" style="margin-top: 24px;">
            <a href="${escapeHtml(p.cvUrl)}" download class="btn btn-primary">Download CV</a>
            <a href="contact.html" class="btn btn-secondary">Contact Me</a>
          </div>
        </div>
        <div>
          <h3>Strengths</h3>
          <ul style="list-style: none; padding-left: 0; margin-bottom: 24px;">
            ${p.strengths.map(s => `
              <li style="padding: 6px 0; color: var(--text-secondary); position: relative; padding-left: 24px;">
                <span style="position: absolute; left: 0; color: var(--accent-green);">✓</span>
                ${escapeHtml(s)}
              </li>
            `).join('')}
          </ul>
          <h3>Interests</h3>
          <div class="skill-tags">
            ${p.interests.map(i => `<span class="skill-tag">${escapeHtml(i)}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* ==================== FORM VALIDATION ==================== */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    const successMsg = $('#form-success');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Honeypot check - if filled, it's a bot
      const honeypot = form.querySelector('.hp-field input');
      if (honeypot && honeypot.value) {
        // Silently "succeed" for bots
        if (successMsg) successMsg.classList.add('show');
        form.reset();
        return;
      }

      let isValid = true;

      // Validate name
      const name = form.querySelector('#name');
      if (name && name.value.trim().length < 2) {
        name.classList.add('invalid');
        isValid = false;
      } else if (name) {
        name.classList.remove('invalid');
      }

      // Validate email
      const email = form.querySelector('#email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email.value.trim())) {
        email.classList.add('invalid');
        isValid = false;
      } else if (email) {
        email.classList.remove('invalid');
      }

      // Validate subject
      const subject = form.querySelector('#subject');
      if (subject && subject.value.trim().length < 3) {
        subject.classList.add('invalid');
        isValid = false;
      } else if (subject) {
        subject.classList.remove('invalid');
      }

      // Validate message
      const message = form.querySelector('#message');
      if (message && message.value.trim().length < 10) {
        message.classList.add('invalid');
        isValid = false;
      } else if (message) {
        message.classList.remove('invalid');
      }

      if (!isValid) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';
      submitBtn.disabled = true;

      const endpoint = PORTFOLIO_DATA.personal.contactFormEndpoint;
      if (!endpoint) {
        const body = `Name: ${name.value.trim()}\nEmail: ${email.value.trim()}\n\n${message.value.trim()}`;
        window.location.href = `mailto:${PORTFOLIO_DATA.personal.email}?subject=${encodeURIComponent(subject.value.trim())}&body=${encodeURIComponent(body)}`;
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
      }

      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(response => {
          if (!response.ok) throw new Error('Message submission failed');
          form.reset();
          if (successMsg) successMsg.classList.add('show');
        })
        .catch(() => {
          if (successMsg) {
            successMsg.textContent = 'Unable to send the message right now. Please use the email link instead.';
            successMsg.classList.add('show');
          }
        })
        .finally(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        });
    });

    // Clear invalid state on input
    $$('.form-control', form).forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('invalid');
      });
    });
  }

  /* ==================== FEEDBACK FORM ==================== */
  function initFeedbackForm() {
    const form = $('#feedback-form');
    if (!form) return;

    const successMsg = $('#feedback-success');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Honeypot check
      const honeypot = form.querySelector('.hp-field input');
      if (honeypot && honeypot.value) {
        if (successMsg) successMsg.classList.add('show');
        form.reset();
        return;
      }

      const feedback = form.querySelector('#feedback');
      if (feedback && feedback.value.trim().length < 10) {
        feedback.classList.add('invalid');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="loading-spinner"></span> Submitting...';
      submitBtn.disabled = true;

      const body = `Feedback from ${form.querySelector('#feedback-name')?.value.trim() || 'a visitor'}:\n\n${feedback.value.trim()}`;
      window.location.href = `mailto:${PORTFOLIO_DATA.personal.email}?subject=${encodeURIComponent('Portfolio feedback')}&body=${encodeURIComponent(body)}`;
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    });

    $$('.form-control', form).forEach(input => {
      input.addEventListener('input', () => input.classList.remove('invalid'));
    });
  }

  /* ==================== RENDER: FOOTER ==================== */
  function renderFooter() {
    const footer = $('#site-footer');
    if (!footer) return;

    const p = PORTFOLIO_DATA.personal;

    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="logo">
              <div class="logo-icon">FM</div>
              <div class="logo-text">
                <span class="logo-name">${escapeHtml(p.name)}</span>
                <span class="logo-title">${escapeHtml(p.shortTitle)}</span>
              </div>
            </div>
            <p>${escapeHtml(p.tagline)}</p>
            <div class="footer-social">
              ${PORTFOLIO_DATA.social.map(s => `
                <a href="${escapeHtml(s.url)}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(s.label)}" title="${escapeHtml(s.label)}">
                  ${getSocialIcon(s.icon)}
                </a>
              `).join('')}
            </div>
          </div>
          <div>
            <h4 class="footer-heading">Quick Links</h4>
            <ul class="footer-links">
              <li><a href="index.html">Home</a></li>
              <li><a href="about.html">About Me</a></li>
              <li><a href="skills.html">Skills</a></li>
              <li><a href="projects.html">Projects</a></li>
              <li><a href="certifications.html">Certifications</a></li>
            </ul>
          </div>
          <div>
            <h4 class="footer-heading">More</h4>
            <ul class="footer-links">
              <li><a href="networking.html">Networking</a></li>
              <li><a href="cybersecurity.html">Cybersecurity</a></li>
              <li><a href="experience.html">Experience</a></li>
              <li><a href="blog.html">Blog</a></li>
              <li><a href="github.html">GitHub</a></li>
              <li><a href="resources.html">Resources</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 class="footer-heading">Contact</h4>
            <ul class="footer-links">
              <li><a href="mailto:${escapeHtml(p.email)}">✉️ ${escapeHtml(p.email)}</a></li>
              <li><a href="${escapeHtml(p.whatsapp)}" target="_blank" rel="noopener noreferrer">📱 ${escapeHtml(p.phone)}</a></li>
              <li><a href="${escapeHtml(p.github)}" target="_blank" rel="noopener noreferrer">🐙 GitHub</a></li>
              <li><a href="${escapeHtml(p.linkedin)}" target="_blank" rel="noopener noreferrer">💼 LinkedIn</a></li>
              <li>📍 ${escapeHtml(p.location)}</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© ${new Date().getFullYear()} ${escapeHtml(p.name)}. All rights reserved. | Built with ❤️ and modern web technologies</p>
          <p style="margin-top: 4px;">
            <a href="privacy.html">Privacy Policy</a> | <a href="sitemap.xml">Sitemap</a>
          </p>
        </div>
      </div>
    `;
  }

  function getSocialIcon(icon) {
    const icons = {
      github: '🐙',
      linkedin: '💼',
      twitter: '🐦',
      whatsapp: '💬',
      email: '✉️'
    };
    return icons[icon] || '🔗';
  }

  /* ==================== RENDER: HEADER ==================== */
  function renderHeader() {
    const header = $('#site-header');
    if (!header) return;

    const p = PORTFOLIO_DATA.personal;

    header.innerHTML = `
      <div class="nav-container">
        <a href="index.html" class="logo" aria-label="${escapeHtml(p.name)} - Home">
          <div class="logo-icon">FM</div>
          <div class="logo-text">
            <span class="logo-name">${escapeHtml(p.name)}</span>
            <span class="logo-title">${escapeHtml(p.shortTitle)}</span>
          </div>
        </a>
        <nav aria-label="Main navigation">
          <ul class="nav-menu" id="nav-menu">
            <li><a href="index.html" class="nav-link">Home</a></li>
            <li><a href="about.html" class="nav-link">About</a></li>
            <li><a href="skills.html" class="nav-link">Skills</a></li>
            <li><a href="projects.html" class="nav-link">Projects</a></li>
            <li><a href="certifications.html" class="nav-link">Certifications</a></li>
            <li><a href="networking.html" class="nav-link">Networking</a></li>
            <li><a href="cybersecurity.html" class="nav-link">Security</a></li>
            <li><a href="experience.html" class="nav-link">Experience</a></li>
            <li><a href="blog.html" class="nav-link">Blog</a></li>
            <li><a href="github.html" class="nav-link">GitHub</a></li>
            <li><a href="resources.html" class="nav-link">Resources</a></li>
            <li><a href="contact.html" class="nav-link">Contact</a></li>
          </ul>
        </nav>
        <div class="nav-actions">
          <button class="theme-toggle" aria-label="Toggle dark mode">🌙</button>
          <button class="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false">☰</button>
        </div>
      </div>
    `;
  }

  /* ==================== INITIALIZE ==================== */
  function init() {
    // Render shared components
    renderHeader();
    renderFooter();

    // Initialize managers
    themeManager.init();
    navManager.init();
    initHeaderScroll();
    initBackToTop();
    initReveal();

    // Theme toggle
    const themeToggle = $('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => themeManager.toggle());
    }

    // Page-specific rendering
    const page = document.body.dataset.page;

    switch (page) {
      case 'home':
        renderHero();
        renderStats();
        renderSkills();
        renderProjects(PORTFOLIO_DATA.projects.filter(p => p.featured));
        renderCertifications(PORTFOLIO_DATA.certifications.slice(0, 4));
        renderExperience();
        renderServices();
        renderTestimonials();
        renderBlogPosts();
        break;
      case 'about':
        renderAbout();
        renderExperience();
        renderEducation();
        renderAchievements();
        break;
      case 'skills':
        renderSkills();
        break;
      case 'projects':
        renderProjects();
        initProjectFilters();
        break;
      case 'live-projects':
        renderLiveProjects();
        break;
      case 'certifications':
        renderCertifications();
        initCertFilters();
        break;
      case 'networking':
        renderNetworking();
        break;
      case 'cybersecurity':
        renderCybersecurity();
        break;
      case 'experience':
        renderExperience();
        renderEducation();
        break;
      case 'achievements':
        renderAchievements();
        break;
      case 'services':
        renderServices();
        break;
      case 'testimonials':
        renderTestimonials();
        break;
      case 'blog':
        renderBlogPosts();
        break;
      case 'project-detail':
        renderProjectDetail();
        break;
      case 'article-detail':
        renderArticleDetail();
        break;
      case 'github':
        renderGitHubRepos();
        break;
      case 'resources':
        renderResources();
        break;
      case 'contact':
        initContactForm();
        break;
      case 'feedback':
        initFeedbackForm();
        break;
    }

    // Hide loading overlay
    const loadingOverlay = $('.loading-overlay');
    if (loadingOverlay) {
      setTimeout(() => loadingOverlay.classList.add('hidden'), 300);
    }
  }

  // Wait for DOM and data to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();