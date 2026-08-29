/* ==========================================================================
   Ploto Privacy Policy - Client Interactivity Script
   ========================================================================== */

(function () {
  'use strict';

  // --- 1. Theme Management (Dark / Light) ---
  const THEME_STORAGE_KEY = 'ploto-theme';

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      const isDark = theme === 'dark';
      themeBtn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      themeBtn.innerHTML = isDark
        ? `<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <circle cx="12" cy="12" r="5"></circle>
             <line x1="12" y1="1" x2="12" y2="3"></line>
             <line x1="12" y1="21" x2="12" y2="23"></line>
             <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
             <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
             <line x1="1" y1="12" x2="3" y2="12"></line>
             <line x1="21" y1="12" x2="23" y2="12"></line>
             <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
             <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
           </svg>`
        : `<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
           </svg>`;
    }
  }

  function initTheme() {
    const currentTheme = getPreferredTheme();
    applyTheme(currentTheme);

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
      });
    }

    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        applyTheme(e.matches ? 'light' : 'dark');
      }
    });
  }

  // --- 2. Language Dropdown Toggle ---
  function initLanguageDropdown() {
    const langBtn = document.getElementById('lang-btn');
    const langDropdown = document.getElementById('lang-dropdown');

    if (!langBtn || !langDropdown) return;

    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = langDropdown.classList.contains('open');
      langDropdown.classList.toggle('open', !isOpen);
      langBtn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!langDropdown.contains(e.target) && !langBtn.contains(e.target)) {
        langDropdown.classList.remove('open');
        langBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Remember language choice
    const langLinks = langDropdown.querySelectorAll('a');
    langLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const selectedLang = link.getAttribute('data-lang');
        if (selectedLang) {
          localStorage.setItem('ploto-lang-selected', selectedLang);
        }
      });
    });
  }

  // --- 3. Table of Contents Scroll Spy ---
  function initScrollSpy() {
    const sections = document.querySelectorAll('.section-card[id]');
    const tocLinks = document.querySelectorAll('.toc-item a');

    if (!sections.length || !tocLinks.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          tocLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.parentElement.classList.add('active');
            } else {
              link.parentElement.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));
  }

  // --- 4. Copy Email & Toast Notification ---
  function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  function initCopyButtons() {
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const textToCopy = btn.getAttribute('data-copy') || 'hiroki.lab@outlook.com';
        try {
          await navigator.clipboard.writeText(textToCopy);
          const originalText = btn.innerHTML;
          const copiedLabel = btn.getAttribute('data-copied-label') || 'Copied!';
          btn.classList.add('copied');
          btn.innerHTML = `<svg class="contact-icon" style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>${copiedLabel}</span>`;
          showToast(copiedLabel);
          setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = originalText;
          }, 2200);
        } catch (err) {
          console.error('Clipboard copy failed:', err);
        }
      });
    });
  }

  // --- 5. Back to Top ---
  function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // --- 6. Initializer ---
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguageDropdown();
    initScrollSpy();
    initCopyButtons();
    initBackToTop();
  });
})();
