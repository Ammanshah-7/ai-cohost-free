// core/js/self-heal.js — AI BRAIN v9999.9 (NO ERRORS)
const AI_BRAIN = {
  VERSION: 'v9999.9',
  safeMode: true,
  API_URL: 'https://syedcohost.onrender.com',
  ASSETS_URL: 'https://syedcohost.netlify.app',
  LOG_ENDPOINT: '/api/client-error',

  logError(type, message, stack = '', url = location.href) {
    if (!this.safeMode) return;
    const payload = { 
      type, message, stack, url, 
      userAgent: navigator.userAgent, 
      timestamp: new Date().toISOString(), 
      version: this.VERSION 
    };
    
    // FIXED: Removed double {{
    navigator.sendBeacon?.(`${this.API_URL}${this.LOG_ENDPOINT}`, JSON.stringify(payload))
      || fetch(`${this.API_URL}${this.LOG_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    
    console.warn(`AI LOG [${type}]: ${message}`);
  },

  fixLinks() {
    let fixed = 0;
    document.querySelectorAll('a[href], link[href], script[src], img[src]').forEach(el => {
      const attr = el.getAttribute('href') ? 'href' : el.getAttribute('src') ? 'src' : null;
      if (!attr) return;
      let path = el.getAttribute(attr);
      if (path.startsWith('pages/') && !path.includes('../')) { 
        path = '../' + path; 
        el.setAttribute(attr, path); 
        fixed++; 
      }
      if (path.includes('syedcohost.netlify.app') && !path.startsWith('http')) { 
        el.setAttribute(attr, 'https://' + path); 
        fixed++; 
      }
    });
    if (fixed) this.logError('FIX_LINKS', `${fixed} paths corrected`);
  },

  async injectHeader() {
    if (document.querySelector('header')) return;
    try {
      const res = await fetch(`${this.ASSETS_URL}/pages/partials/header.html`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const html = await res.text();
      document.body.insertAdjacentHTML('afterbegin', html);
      this.initNav();
      this.logError('INJECT', 'Header loaded');
    } catch (err) { 
      this.logError('HEADER_FAIL', err.message); 
    }
  },

  initNav() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) btn.onclick = () => menu.classList.toggle('hidden');
    
    const path = location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href')?.split('/').pop();
      if (href === path || (path === '' && href === 'index.html')) {
        link.classList.add('active', 'text-yellow-400', 'font-bold');
      }
    });
  },

  async checkAPI() {
    try { 
      const res = await fetch(`${this.API_URL}/`, { method: 'HEAD' }); 
      if (res.ok) return; 
    } catch { 
      this.API_URL = 'http://localhost:5000'; 
      this.logError('API_FALLBACK', 'Using localhost'); 
    }
  },

  initPWA() {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => { 
      e.preventDefault(); 
      deferredPrompt = e; 
      this.showInstallButton(); 
    });
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${this.ASSETS_URL}/sw.js`)
        .then(() => console.log('PWA: Ready'))
        .catch(err => this.logError('SW_FAIL', err.message));
    }
  },

  showInstallButton() {
    if (document.getElementById('pwa-install')) return;
    const btn = document.createElement('button');
    btn.id = 'pwa-install'; 
    btn.innerHTML = 'Install App';
    btn.className = 'fixed bottom-4 right-4 bg-cyan-600 text-white px-4 py-2 rounded-full shadow-lg z-50';
    btn.onclick = () => { 
      deferredPrompt.prompt(); 
      deferredPrompt.userChoice.then(choice => { 
        if (choice.outcome === 'accepted') { 
          btn.remove(); 
          this.logError('PWA', 'Installed'); 
        } 
      }); 
    };
    document.body.appendChild(btn);
  },

  monitorPerformance() {
    const perf = performance.getEntriesByType('navigation')[0];
    if (perf && perf.loadEventEnd - perf.fetchStart > 3000) {
      this.logError('SLOW', `Load: ${(perf.loadEventEnd - perf.fetchStart).toFixed(0)}ms`);
    }
  },

  checkForUpdates() {
    setInterval(async () => {
      try {
        const res = await fetch(`${this.ASSETS_URL}/version.txt?t=${Date.now()}`);
        const latest = await res.text().trim();
        if (latest !== this.VERSION) this.showUpdateBanner(latest);
      } catch {}
    }, 3600000);
  },

  showUpdateBanner(version) {
    if (document.getElementById('update-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.innerHTML = `
      <div class="fixed top-0 left-0 w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white p-3 text-center z-50">
        Update ${version} ready! <a href="" class="underline">Reload</a>
      </div>`;
    document.body.prepend(banner);
    banner.querySelector('a').onclick = (e) => { e.preventDefault(); location.reload(); };
  },

  async run() {
    console.log(`AI BRAIN ${this.VERSION} — SAFE MODE`);
    this.fixLinks();
    await this.injectHeader();
    await this.checkAPI();
    this.initPWA();
    this.monitorPerformance();
    this.checkForUpdates();
    setInterval(() => this.fixLinks(), 5000);
  }
};

// RUN AI BRAIN
document.addEventListener('DOMContentLoaded', () => { 
  if (AI_BRAIN.safeMode) AI_BRAIN.run(); 
});

// GLOBAL ERROR CATCH
window.addEventListener('error', (e) => AI_BRAIN.logError('JS_ERROR', e.message, e.error?.stack));
window.addEventListener('unhandledrejection', (e) => AI_BRAIN.logError('PROMISE', e.reason));