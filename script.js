(() => {
  const root = document.documentElement;
  const body = document.body;

  root.dataset.theme = localStorage.evTheme || 'light';
  root.dir = localStorage.evDir || 'ltr';
  body.classList.toggle('rtl', root.dir === 'rtl');

  // Populate hamburger drawer with exact desktop menus and button controls
  const desktopActions = document.querySelector('.header .actions');
  const mobileNav = document.querySelector('.mobile');
  if (desktopActions && mobileNav && !mobileNav.querySelector('.mobile-actions')) {
    mobileNav
      .querySelectorAll('a[href="dashboard.html"], a[href="login.html"], a[href="signup.html"]')
      .forEach((extra) => extra.remove());

    const box = document.createElement('div');
    box.className = 'mobile-actions';
    Array.from(desktopActions.children).forEach((item) => {
      if (!item.classList.contains('menu')) {
        box.appendChild(item.cloneNode(true));
      }
    });
    mobileNav.appendChild(box);
  }

  function refreshControls() {
    const isDark = root.dataset.theme === 'dark';
    const isRtl = root.dir === 'rtl';

    document.querySelectorAll('button[data-theme]').forEach((btn) => {
      btn.textContent = isDark ? 'Light' : 'Dark';
      btn.setAttribute('aria-pressed', String(isDark));
    });

    document.querySelectorAll('button[data-dir]').forEach((btn) => {
      btn.textContent = root.dir.toUpperCase();
      btn.setAttribute('aria-pressed', String(isRtl));
    });
  }

  document.querySelectorAll('button[data-theme]').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      localStorage.evTheme = root.dataset.theme;
      refreshControls();
    });
  });

  document.querySelectorAll('button[data-dir]').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.dir = root.dir === 'rtl' ? 'ltr' : 'rtl';
      body.classList.toggle('rtl', root.dir === 'rtl');
      localStorage.evDir = root.dir;
      refreshControls();
    });
  });

  refreshControls();

  // Highlight active navigation link
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.links a, .mobile > a').forEach((link) => {
    const target = link.getAttribute('href');
    if (target === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // Mobile navigation toggle
  const menuBtn = document.querySelector('.menu');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Toast notification helper
  let toastTimer;
  function notify(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  // Password visibility toggle (Auth pages)
  document.querySelectorAll('[data-pw-toggle]').forEach((btn) => {
    const input = document.getElementById(btn.dataset.pwToggle);
    if (!input) return;
    btn.addEventListener('click', () => {
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(reveal));
      btn.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
    });
  });

  // Confirm password match validation (Signup page)
  document.querySelectorAll('[data-match]').forEach((confirmInput) => {
    const source = document.getElementById(confirmInput.dataset.match);
    if (!source) return;
    const syncMatch = () => {
      if (confirmInput.value && confirmInput.value !== source.value) {
        confirmInput.setCustomValidity('Passwords do not match.');
      } else {
        confirmInput.setCustomValidity('');
      }
    };
    confirmInput.addEventListener('input', syncMatch);
    source.addEventListener('input', syncMatch);
  });

  // Demo forms
  document.querySelectorAll('form[data-demo]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.querySelectorAll('[data-match]').forEach((confirmInput) => {
        const source = document.getElementById(confirmInput.dataset.match);
        if (source && confirmInput.value !== source.value) {
          confirmInput.setCustomValidity('Passwords do not match.');
        } else {
          confirmInput.setCustomValidity('');
        }
      });
      if (form.reportValidity()) {
        notify(
          form.dataset.msg ||
            'Demo form validated. Connect a backend to receive submissions.'
        );
        if (form.classList.contains('foot-form')) {
          form.reset();
        }
      }
    });
  });

  // Demo interactive buttons and links
  document.querySelectorAll('button[data-demo], a[data-demo]').forEach((el) => {
    el.addEventListener('click', (event) => {
      if (el.tagName === 'A') {
        event.preventDefault();
      }
      if (el.classList.contains('panel')) {
        const group = el.parentElement;
        if (group) {
          group.querySelectorAll('button.panel').forEach((sibling) => {
            sibling.classList.remove('active');
            sibling.setAttribute('aria-pressed', 'false');
          });
        }
        el.classList.add('active');
        el.setAttribute('aria-pressed', 'true');
      }
      const stage = document.querySelector('[data-swatch-stage]');
      if (stage && el.dataset.color) {
        const orb = stage.querySelector('.swatch-orb');
        const title = stage.querySelector('[data-swatch-title]');
        const desc = stage.querySelector('[data-swatch-desc]');
        if (orb) orb.style.background = el.dataset.color;
        if (title) title.textContent = el.dataset.title || el.textContent.trim();
        if (desc && el.dataset.desc) desc.textContent = el.dataset.desc;
      }
      notify(el.dataset.demo || 'Demo action triggered.');
    });
  });

  // Drive mode tabs (Home 2)
  document.querySelectorAll('[data-mode-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.modeBtn;
      document.querySelectorAll('[data-mode-btn]').forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', String(active));
      });
      document.querySelectorAll('[data-mode-panel]').forEach((panel) => {
        panel.classList.toggle('active', panel.dataset.modePanel === target);
      });
    });
  });

  // Dashboard in-page menu switching (no external redirects)
  const dashViews = document.querySelectorAll('[data-dash-view]');
  if (dashViews.length) {
    const dashNavBtns = document.querySelectorAll('[data-dash-nav]');
    const sideMenuBtn = document.querySelector('.side-menu-btn');
    const sideDrawer = document.querySelector('.side-drawer');

    const closeDashDrawer = () => {
      if (sideDrawer && sideMenuBtn) {
        sideDrawer.classList.remove('open');
        sideMenuBtn.setAttribute('aria-expanded', 'false');
      }
    };

    if (sideMenuBtn && sideDrawer) {
      sideMenuBtn.addEventListener('click', () => {
        const open = sideDrawer.classList.toggle('open');
        sideMenuBtn.setAttribute('aria-expanded', String(open));
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sideDrawer.classList.contains('open')) {
          closeDashDrawer();
        }
      });
    }

    const activateView = (viewName) => {
      dashViews.forEach((view) => {
        view.classList.toggle('active', view.dataset.dashView === viewName);
      });
      document.querySelectorAll('.side-link[data-dash-nav]').forEach((btn) => {
        const isActive = btn.dataset.dashNav === viewName;
        btn.classList.toggle('active', isActive);
        if (isActive) {
          btn.setAttribute('aria-current', 'page');
        } else {
          btn.removeAttribute('aria-current');
        }
      });
      closeDashDrawer();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    dashNavBtns.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        if (trigger.tagName === 'A') {
          event.preventDefault();
        }
        activateView(trigger.dataset.dashNav);
      });
    });
  }

  // Savings calculator
  document.querySelectorAll('[data-calc]').forEach((form) => {
    const outEl = form.querySelector('[data-out]');
    const fiveEl = form.querySelector('[data-five]');

    const calculate = () => {
      const km = Math.max(0, Number(form.km?.value) || 0);
      const petrol = Math.max(0, Number(form.petrol?.value) || 0);
      const mileage = Math.max(0.1, Number(form.mileage?.value) || 1);
      const electricity = Math.max(0, Number(form.electricity?.value) || 0);
      const efficiency = Math.max(
        0,
        form.efficiency ? Number(form.efficiency.value) || 0 : 15
      );

      const dailyPetrolCost = (km / mileage) * petrol;
      const dailyEvCost = (km * efficiency / 100) * electricity;
      const monthlySavings = Math.max(0, (dailyPetrolCost - dailyEvCost) * 30);

      if (outEl) {
        outEl.textContent = '₹' + Math.round(monthlySavings).toLocaleString('en-IN');
      }
      if (fiveEl) {
        fiveEl.textContent =
          '₹' + Math.round(monthlySavings * 60).toLocaleString('en-IN');
      }
    };

    form.addEventListener('input', calculate);
    calculate();
  });
})();
