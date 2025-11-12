// pages/host/host.js — HOST PORTAL v9999.9
const HOST_PORTAL = {
  API_URL: 'https://syedcohost.onrender.com',

  init() {
    this.checkAuth();
    this.showWelcome();
  },

  checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
      setTimeout(() => {
        if (confirm('Login to host?')) {
          window.location = '../auth/login.html';
        }
      }, 2000);
    }
  },

  showWelcome() {
    const widget = document.getElementById('chat-widget');
    widget.innerHTML = `
      <div class="p-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold shadow-2xl animate-pulse">
        <i class="fas fa-brain"></i> Welcome, Host! AI is ready.
      </div>`;
    setTimeout(() => widget.innerHTML = '', 4000);
  }
};

// INIT
document.addEventListener('DOMContentLoaded', () => HOST_PORTAL.init());