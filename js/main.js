/* ==========================================================================
   Hossam "ShifOo" Shiref — Portfolio Interactions
   Scroll handling, terminal simulation, tab switching, observers
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------------------------
     1. Navbar: backdrop blur on scroll
     ----------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');

  function handleNavScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('nav-scrolled');
    } else {
      navbar.classList.remove('nav-scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* -----------------------------------------------------------------------
     2. Mobile menu toggle
     ----------------------------------------------------------------------- */
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIconOpen = document.getElementById('menu-icon-open');
  const menuIconClose = document.getElementById('menu-icon-close');

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      if (menuIconOpen && menuIconClose) {
        menuIconOpen.classList.toggle('hidden');
        menuIconClose.classList.toggle('hidden');
      }
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        if (menuIconOpen && menuIconClose) {
          menuIconOpen.classList.remove('hidden');
          menuIconClose.classList.add('hidden');
        }
      });
    });
  }

  /* -----------------------------------------------------------------------
     3. Smooth scroll for anchor links
     ----------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* -----------------------------------------------------------------------
     4. Section fade-in on scroll (IntersectionObserver)
     ----------------------------------------------------------------------- */
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
  );

  document.querySelectorAll('.fade-section').forEach(el => {
    fadeObserver.observe(el);
  });

  /* -----------------------------------------------------------------------
     5. Timeline entries fade-in
     ----------------------------------------------------------------------- */
  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger the animation
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 120);
          timelineObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.timeline-entry').forEach(el => {
    timelineObserver.observe(el);
  });

  /* -----------------------------------------------------------------------
     6. Active nav link highlighting
     ----------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('text-gray-900');
              link.classList.remove('text-gray-500');
            } else {
              link.classList.remove('text-gray-900');
              link.classList.add('text-gray-500');
            }
          });
        }
      });
    },
    { threshold: 0.2, rootMargin: '-80px 0px -55% 0px' }
  );

  sections.forEach(section => navObserver.observe(section));

  /* -----------------------------------------------------------------------
     7. Interactive Terminal Widget
     ----------------------------------------------------------------------- */
  const terminalOutput = document.getElementById('terminal-output');
  const terminalTabs = document.querySelectorAll('.tab-btn');
  const runBtn = document.getElementById('terminal-run');

  let currentDemo = 'data-cleaner';
  let typingTimeout = null;
  let isTyping = false;

  const demos = {
    'data-cleaner': [
      { type: 'prompt',  text: '$ python data_cleaner.py --input sales_2026.csv' },
      { type: 'info',    text: '📂 Loading sales_2026.csv... (2,847 rows × 12 columns)' },
      { type: 'comment', text: '   Analyzing data quality...' },
      { type: 'default', text: '' },
      { type: 'error',   text: '⚠  Found 143 null values across 4 columns' },
      { type: 'error',   text: '⚠  Found 28 duplicate rows' },
      { type: 'error',   text: '⚠  Found 12 malformed date entries' },
      { type: 'default', text: '' },
      { type: 'info',    text: '🔧 Applying automated cleaning pipeline...' },
      { type: 'comment', text: '   → Imputing missing values (median strategy)' },
      { type: 'comment', text: '   → Removing 28 duplicate entries' },
      { type: 'comment', text: '   → Standardizing date format to ISO-8601' },
      { type: 'comment', text: '   → Normalizing currency columns' },
      { type: 'default', text: '' },
      { type: 'success', text: '✓ Cleaned dataset: 2,819 rows × 12 columns' },
      { type: 'success', text: '✓ Data quality score: 67% → 98.4%' },
      { type: 'success', text: '✓ Exported → sales_2026_clean.csv' },
      { type: 'default', text: '' },
      { type: 'prompt',  text: '$ _' },
    ],
    'covra-scan': [
      { type: 'prompt',  text: '$ covra scan --target ./src --mode deep' },
      { type: 'info',    text: '🔍 COVRA v2.4.0 — Local DevSecOps Agent' },
      { type: 'comment', text: '   Initializing Semgrep analysis engine...' },
      { type: 'comment', text: '   Scanning 47 files across 8 directories...' },
      { type: 'default', text: '' },
      { type: 'info',    text: '📋 Scan Results:' },
      { type: 'error',   text: '  CRITICAL  SQL Injection in db/queries.py:42' },
      { type: 'error',   text: '  HIGH      Hardcoded API key in config/auth.js:15' },
      { type: 'default', text: '  MEDIUM    Missing rate limiting on /api/login' },
      { type: 'default', text: '' },
      { type: 'info',    text: '🔧 Applying automated fixes...' },
      { type: 'success', text: '  ✓ Parameterized SQL query in db/queries.py' },
      { type: 'success', text: '  ✓ Moved API key to .env (added to .gitignore)' },
      { type: 'success', text: '  ✓ Added rate limiter middleware to /api/login' },
      { type: 'default', text: '' },
      { type: 'success', text: '✓ 3/3 vulnerabilities auto-fixed' },
      { type: 'success', text: '✓ All data stayed local — zero cloud exposure' },
      { type: 'default', text: '' },
      { type: 'prompt',  text: '$ _' },
    ]
  };

  function stopTyping() {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      typingTimeout = null;
    }
    isTyping = false;
  }

  function typeLines(lines) {
    stopTyping();
    if (!terminalOutput) return;
    terminalOutput.innerHTML = '';
    isTyping = true;
    let lineIndex = 0;

    function typeLine() {
      if (lineIndex >= lines.length || !isTyping) {
        isTyping = false;
        return;
      }

      const line = lines[lineIndex];
      const div = document.createElement('div');
      div.className = 'terminal-line' + (line.type !== 'default' ? ' ' + line.type : '');

      if (line.text === '') {
        div.innerHTML = '&nbsp;';
      } else {
        div.textContent = line.text;
      }

      div.style.opacity = '0';
      div.style.transform = 'translateY(5px)';
      terminalOutput.appendChild(div);

      requestAnimationFrame(() => {
        div.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        div.style.opacity = '1';
        div.style.transform = 'translateY(0)';
      });

      terminalOutput.scrollTop = terminalOutput.scrollHeight;

      lineIndex++;
      const delay = line.type === 'prompt' ? 500
                  : line.text === '' ? 180
                  : 100 + Math.random() * 100;

      typingTimeout = setTimeout(typeLine, delay);
    }

    typeLine();
  }

  // Tab switching
  terminalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentDemo = tab.dataset.tab;
      terminalTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      typeLines(demos[currentDemo]);
    });
  });

  // Run button
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      typeLines(demos[currentDemo]);
    });
  }

  // Auto-start terminal when it scrolls into view
  const terminalSection = document.getElementById('terminal');
  if (terminalSection) {
    const terminalObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            typeLines(demos[currentDemo]);
            terminalObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    terminalObserver.observe(terminalSection);
  }

  /* -----------------------------------------------------------------------
     8. Copyright year
     ----------------------------------------------------------------------- */
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
