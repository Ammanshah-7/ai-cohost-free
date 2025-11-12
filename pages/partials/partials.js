// partials/partials.js — v9999.9 | FINAL | SELF-HEALING | ERROR-PROOF
const PARTIALS = {
  init() {
    this.injectPartials()
      .then(() => this.afterInject())
      .catch(err => console.error('PARTIALS: Inject failed →', err));
  },

  async injectPartials() {
    const headerDiv = document.getElementById('header');
    if (!headerDiv) return;

    try {
      // INJECT HEADER
      const headerRes = await fetch('../partials/header.html');
      if (!headerRes.ok) throw new Error(`Header ${headerRes.status}`);
      const headerHTML = await headerRes.text();
      headerDiv.innerHTML = headerHTML;

      // INJECT FOOTER
      const footerRes = await fetch('../partials/footer.html');
      if (!footerRes.ok) throw new Error(`Footer ${footerRes.status}`);
      const footerHTML = await footerRes.text();
      document.body.insertAdjacentHTML('beforeend', footerHTML);

    } catch (err) {
      console.warn('PARTIALS: Offline mode → minimal UI');
      headerDiv.innerHTML = `
        <div class="p-4 bg-gray-900 text-center text-cyan-400 font-bold">
          <i class="fas fa-wifi"></i> Offline • <a href="../intro/index.html" class="underline">Reload</a>
        </div>`;
    }
  },

  afterInject() {
    this.handleAuth();
    this.handleTheme();
    this.handleMobileMenu();
    this.setupDropdown();
    this.showWelcome();
    console.log('PARTIALS v9999.9 → LOADED');
  },

  handleAuth() {
    const token = localStorage.getItem('token');
    let role = null;
    try {
      if (token) role = JSON.parse(atob(token.split('.')[1])).role;
    } catch (e) {
      localStorage.removeItem('token');
    }

    const authLinks = document.getElementById('auth-links');
    const userLinks = document.getElementById('user-links');
    const ownerLink = document.getElementById('owner-link');
    const mobileOwnerLink = document.getElementById('mobile-owner-link');

    if (token && userLinks) {
      authLinks?.classList.add('hidden');
      userLinks.classList.remove('hidden');
      if (role === 'owner') {
        [ownerLink, mobileOwnerLink].forEach(el => el && (el.style.display = 'block'));
      }
    }

    document.getElementById('logout-btn')?.addEventListener('click', () => {
      if (confirm('Logout?')) {
        localStorage.removeItem('token');
        window.location.reload();
      }
    });
  },

  handleTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const saved = localStorage.getItem('theme');
    const current = saved || 'dark';
    document.documentElement.setAttribute('data-theme', current);
    this.updateToggleIcon(toggle, current);

    toggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      this.updateToggleIcon(toggle, newTheme);
    });
  },

  updateToggleIcon(toggle, theme) {
    toggle.innerHTML = theme === 'dark'
      ? '<i class="fas fa-moon"></i>'
      : '<i class="fas fa-sun"></i>';
  },

  handleMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.mobile-nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      nav.classList.toggle('hidden');
      btn.innerHTML = nav.classList.contains('hidden')
        ? '<i class="fas fa-bars"></i>'
        : '<i class="fas fa-times"></i>';
    });
  },

  setupDropdown() {
    const dropdown = document.querySelector('.dropdown');
    if (!dropdown) return;

    dropdown.addEventListener('mouseenter', () => dropdown.classList.add('hover'));
    dropdown.addEventListener('mouseleave', () => dropdown.classList.remove('hover'));
  },

  showWelcome() {
    const widget = document.getElementById('chat-widget');
    if (!widget) return;

    widget.innerHTML = `
      <div class="p-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-bold shadow-xl animate-pulse">
        <i class="fas fa-brain"></i> SYED AI • Ready
      </div>`;
    setTimeout(() => widget.innerHTML = '', 3000);
  }
};

// AUTO INIT — SAFE & ROBUST
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('header')) {
    PARTIALS.init();
  }
});

// EXPORT FOR DEBUG (optional)
window.PARTIALS = PARTIALS;