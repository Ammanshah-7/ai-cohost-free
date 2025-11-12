// intro/intro.js — EPIC v9999.9
const INTRO = {
  init() {
    this.scrollEffects();
    this.pwaInstall();
    this.showWelcome();
  },

  scrollEffects() {
    const hero = document.querySelector('.hero');
    const title = document.querySelector('.hero-title');
    const stats = document.querySelectorAll('.stat .number');

    window.addEventListener('scroll', () => {
      const scroll = window.scrollY;
      hero.style.backgroundPositionY = `${scroll * 0.5}px`;
      title.style.transform = `translateY(${scroll * 0.3}px)`;
      
      stats.forEach((stat, i) => {
        if (scroll > 300) {
          this.animateNumber(stat, stat.textContent);
        }
      });
    });
  },

  animateNumber(el, target) {
    if (el.dataset.animated) return;
    el.dataset.animated = true;
    let num = 0;
    const increment = target.includes('%') ? 1 : Math.ceil(parseInt(target.replace(/[^0-9]/g, '')) / 50);
    const interval = setInterval(() => {
      num += increment;
      if (num >= parseInt(target)) {
        el.textContent = target;
        clearInterval(interval);
      } else {
        el.textContent = num + (target.includes('$') ? '$' : target.includes('%') ? '%' : '');
      }
    }, 30);
  },

  pwaInstall() {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      deferredPrompt = e;
      const installBtn = document.createElement('div');
      installBtn.innerHTML = `<i class="fas fa-download"></i> Install App`;
      installBtn.className = 'fixed bottom-6 left-6 bg-cyan-600 text-white px-6 py-3 rounded-full shadow-2xl cursor-pointer z-50 animate-pulse';
      installBtn.onclick = () => {
        installBtn.style.display = 'none';
        deferredPrompt.prompt();
      };
      document.body.appendChild(installBtn);
    });
  },

  showWelcome() {
    const widget = document.getElementById('chat-widget');
    widget.innerHTML = `
      <div class="p-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold shadow-2xl animate-bounce">
        <i class="fas fa-brain"></i> Welcome to SYED AI
      </div>`;
    setTimeout(() => widget.innerHTML = '', 4000);
  }
};

document.addEventListener('DOMContentLoaded', () => INTRO.init());