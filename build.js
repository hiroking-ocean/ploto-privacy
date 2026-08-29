/**
 * Ploto Privacy Policy - Static Site Generator
 * 
 * Generates SEO-optimized, static HTML pages for all 7 supported languages:
 * - ja (root index.html)
 * - en (/en/index.html)
 * - de (/de/index.html)
 * - fr (/fr/index.html)
 * - es (/es/index.html)
 * - ko (/ko/index.html)
 * - pt-BR (/pt-br/index.html)
 * 
 * Also generates sitemap.xml and updates README.md.
 * Requires only native Node.js (no external npm dependencies).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = 'https://hiroking-ocean.github.io/ploto-privacy/';
const LP_URL = 'https://hiroking-ocean.github.io/ploto_LP/';
const REPO_URL = 'https://github.com/hiroking-ocean/ploto-privacy';

const LOCALES_DATA_PATH = join(__dirname, 'data', 'locales.json');
const localesData = JSON.parse(readFileSync(LOCALES_DATA_PATH, 'utf-8'));

const LANG_KEYS = ['ja', 'en', 'de', 'fr', 'es', 'ko', 'pt-BR'];

// Simple markdown-to-html formatter for bold, code, and links
function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// Map icons to inline SVG
function getIconSvg(iconName) {
  switch (iconName) {
    case 'shield':
      return `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="M9 12l2 2 4-4"></path>
      </svg>`;
    case 'database':
      return `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
      </svg>`;
    case 'key':
      return `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="7.5" cy="15.5" r="4.5"></circle>
        <path d="M10.7 12.3L21 2l2 2-2 2 2 2-2 2-1.5-1.5L18 12l-1.5-1.5"></path>
      </svg>`;
    case 'globe':
      return `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>`;
    default:
      return `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`;
  }
}

function buildHtmlForLanguage(langKey) {
  const data = localesData[langKey];
  const isRoot = langKey === 'ja';
  const relPrefix = isRoot ? './' : '../';

  // Hreflang links
  const hreflangTags = LANG_KEYS.map((k) => {
    const item = localesData[k];
    const url = item.slug ? `${SITE_URL}${item.slug}/` : SITE_URL;
    const hreflangCode = item.code.toLowerCase();
    return `  <link rel="alternate" hreflang="${hreflangCode}" href="${url}" />`;
  }).join('\n');

  const canonicalUrl = data.slug ? `${SITE_URL}${data.slug}/` : SITE_URL;

  // Language Dropdown Items
  const langDropdownItems = LANG_KEYS.map((k) => {
    const item = localesData[k];
    const targetUrl = item.slug ? `${relPrefix}${item.slug}/` : `${relPrefix}`;
    const isActive = k === langKey ? ' active' : '';
    return `            <li class="lang-item${isActive}"><a href="${targetUrl}" data-lang="${item.code}">${item.name}</a></li>`;
  }).join('\n');

  // Summary Cards
  const summaryCardsHtml = data.summary.cards.map((card) => `
          <div class="summary-card">
            <div class="card-icon-wrap">
              ${getIconSvg(card.icon)}
            </div>
            <h3>${card.title}</h3>
            <p>${card.desc}</p>
          </div>`).join('\n');

  // Table of Contents
  const tocItemsHtml = data.sections.map((sec) => `
              <li class="toc-item"><a href="#${sec.id}">${sec.title}</a></li>`).join('\n');

  // Content Sections
  const sectionsHtml = data.sections.map((sec) => {
    const paragraphsHtml = sec.content.map((p) => `          <p>${formatMarkdown(p)}</p>`).join('\n');

    let subsectionsHtml = '';
    if (sec.subsections && sec.subsections.length > 0) {
      const subItems = sec.subsections.map((sub) => `
            <div class="subsection-card" id="${sub.id}">
              <h3 class="subsection-title">${sub.title}</h3>
              ${sub.content.map((p) => `<p>${formatMarkdown(p)}</p>`).join('\n')}
            </div>`).join('\n');

      subsectionsHtml = `
          <div class="subsections">
            ${subItems}
          </div>`;
    }

    let contactBoxHtml = '';
    if (sec.contactBox) {
      contactBoxHtml = `
          <div class="contact-box">
            <div class="contact-email-wrap">
              <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span class="contact-email">${sec.contactBox.email}</span>
            </div>
            <button class="copy-btn" id="copy-email-btn" data-copy="${sec.contactBox.email}" data-copied-label="${data.nav.copied}">
              <svg class="contact-icon" style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>${data.nav.copy}</span>
            </button>
            <div class="contact-note">${sec.contactBox.note}</div>
          </div>`;
    }

    return `
        <article class="section-card" id="${sec.id}">
          <h2 class="section-title">${sec.title}</h2>
          <div class="section-body">
            ${paragraphsHtml}
            ${subsectionsHtml}
            ${contactBoxHtml}
          </div>
        </article>`;
  }).join('\n');

  // Root-only language redirect script
  const rootRedirectScript = isRoot ? `
  <script>
    (function() {
      // Automatic language redirection for first-time visitors
      try {
        const stored = localStorage.getItem('ploto-lang-selected');
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('lang') || stored === 'ja') return;

        if (stored) {
          const target = stored === 'pt-BR' ? 'pt-br' : stored.toLowerCase();
          if (['en', 'de', 'fr', 'es', 'ko', 'pt-br'].includes(target)) {
            window.location.replace('./' + target + '/');
            return;
          }
        }

        const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
        if (navLang.startsWith('en')) { window.location.replace('./en/'); }
        else if (navLang.startsWith('de')) { window.location.replace('./de/'); }
        else if (navLang.startsWith('fr')) { window.location.replace('./fr/'); }
        else if (navLang.startsWith('es')) { window.location.replace('./es/'); }
        else if (navLang.startsWith('ko')) { window.location.replace('./ko/'); }
        else if (navLang.startsWith('pt')) { window.location.replace('./pt-br/'); }
      } catch (e) {
        // Fallback: stay on Japanese page
      }
    })();
  </script>` : '';

  return `<!DOCTYPE html>
<html lang="${data.code}" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.title}</title>
  <meta name="description" content="${data.description}" />
  <link rel="canonical" href="${canonicalUrl}" />
${hreflangTags}
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}" />

  <!-- Open Graph / Social Meta -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${data.title}" />
  <meta property="og:description" content="${data.description}" />
  <meta property="og:locale" content="${data.ogLocale}" />
  <meta property="og:site_name" content="Ploto" />
  <meta property="og:image" content="${SITE_URL}assets/app-icon.svg" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${data.title}" />
  <meta name="twitter:description" content="${data.description}" />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="${relPrefix}assets/app-icon.svg" />

  <!-- Fonts (Outfit & Inter) -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet" />

  <!-- Stylesheet -->
  <link rel="stylesheet" href="${relPrefix}styles.css" />
${rootRedirectScript}
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="container header-container">
      <a href="${canonicalUrl}" class="brand-link" aria-label="Ploto Home">
        <img src="${relPrefix}assets/logo.svg" alt="Ploto Logo" class="brand-logo" />
        <span class="brand-title">Ploto</span>
      </a>

      <div class="header-actions">
        <!-- Language Selector -->
        <div class="lang-selector">
          <button class="lang-btn" id="lang-btn" aria-haspopup="true" aria-expanded="false" aria-label="${data.nav.language}">
            <svg class="lang-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>${data.name}</span>
            <svg class="lang-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <ul class="lang-dropdown" id="lang-dropdown">
${langDropdownItems}
          </ul>
        </div>

        <!-- Theme Toggle -->
        <button class="theme-btn" id="theme-toggle-btn" aria-label="${data.nav.themeLight}">
          <svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>

        <!-- Product LP Link -->
        <a href="${LP_URL}" class="lp-link-btn" target="_blank" rel="noopener noreferrer">
          <span>${data.nav.lpLink}</span>
          <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero -->
  <section class="hero">
    <div class="container hero-content">
      <div class="badge">
        <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        <span>${data.summary.badge}</span>
      </div>
      <h1 class="hero-title">${data.summary.title}</h1>
      <p class="hero-desc">${data.summary.description}</p>
      
      <div class="hero-meta">
        <div class="meta-item">
          <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>${data.app.lastUpdatedLabel}: <strong>${data.app.lastUpdatedValue}</strong></span>
        </div>
        <div class="meta-item">
          <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>${data.app.contactLabel}: <strong>${data.app.contactEmail}</strong></span>
        </div>
      </div>
    </div>
  </section>

  <!-- Summary Cards -->
  <section class="container">
    <div class="summary-grid">
${summaryCardsHtml}
    </div>
  </section>

  <!-- Main Policy Section -->
  <main class="container policy-layout">
    <!-- Sticky Table of Contents -->
    <aside class="toc-sidebar">
      <div class="toc-header">
        <svg class="toc-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <span>${data.tocTitle}</span>
      </div>
      <ul class="toc-list">
${tocItemsHtml}
      </ul>
    </aside>

    <!-- Content Articles -->
    <div class="policy-content">
${sectionsHtml}
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-container">
      <div>${data.footer.rights}</div>
      <div class="footer-links">
        <a href="${REPO_URL}" class="footer-link" target="_blank" rel="noopener noreferrer">${data.footer.githubLink}</a>
        <a href="${LP_URL}" class="footer-link" target="_blank" rel="noopener noreferrer">${data.footer.lpLink}</a>
        <a href="#top" class="back-to-top-btn" id="back-to-top-btn">
          <span>${data.footer.backToTop}</span>
          <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </a>
      </div>
    </div>
  </footer>

  <!-- Script -->
  <script src="${relPrefix}app.js"></script>
</body>
</html>`;
}

// Generate Sitemap XML
function generateSitemap() {
  const lastmod = '2026-09-01';
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  LANG_KEYS.forEach((k) => {
    const item = localesData[k];
    const url = item.slug ? `${SITE_URL}${item.slug}/` : SITE_URL;
    xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${k === 'ja' || k === 'en' ? '1.0' : '0.8'}</priority>\n`;

    LANG_KEYS.forEach((otherK) => {
      const otherItem = localesData[otherK];
      const otherUrl = otherItem.slug ? `${SITE_URL}${otherItem.slug}/` : SITE_URL;
      xml += `    <xhtml:link rel="alternate" hreflang="${otherItem.code.toLowerCase()}" href="${otherUrl}" />\n`;
    });
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}" />\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  return xml;
}

// Main Build Runner
function runBuild() {
  console.log('Building Ploto Privacy Policy pages for 7 languages...');

  // 1. Build HTML for each language
  LANG_KEYS.forEach((k) => {
    const item = localesData[k];
    const html = buildHtmlForLanguage(k);

    if (k === 'ja') {
      const outPath = join(__dirname, 'index.html');
      writeFileSync(outPath, html, 'utf-8');
      console.log(`✓ Generated root index.html (ja)`);
    } else {
      const langDir = join(__dirname, item.slug);
      if (!existsSync(langDir)) {
        mkdirSync(langDir, { recursive: true });
      }
      const outPath = join(langDir, 'index.html');
      writeFileSync(outPath, html, 'utf-8');
      console.log(`✓ Generated ${item.slug}/index.html (${k})`);
    }
  });

  // 2. Build sitemap.xml
  const sitemapXml = generateSitemap();
  writeFileSync(join(__dirname, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`✓ Generated sitemap.xml`);

  console.log('Build completed successfully!');
}

runBuild();
