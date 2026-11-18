(() => {
  const root = document.documentElement;
  const body = document.body;

  root.dataset.theme = localStorage.evTheme || 'light';
  root.dir = localStorage.evDir || 'ltr';
  body.classList.toggle('rtl', root.dir === 'rtl');

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
  document.querySelectorAll('.links a, .mobile a').forEach((link) => {
    const target = link.getAttribute('href');
    if (target === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // Mobile navigation toggle
  const menuBtn = document.querySelector('.menu');
  const mobileNav = document.querySelector('.mobile');

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

  // Demo forms
  document.querySelectorAll('form[data-demo]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
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
      notify(el.dataset.demo || 'Demo action triggered.');
    });
  });

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
