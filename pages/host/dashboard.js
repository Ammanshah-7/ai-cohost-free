// pages/host/dashboard.js — AI HOST DASHBOARD v9999.9
const HOST_DASHBOARD = {
  socket: null,
  stats: { bookings: 0, revenue: 0, profit: 0 },
  API_URL: 'https://syedcohost.onrender.com',

  init() {
    this.initSocket();
    this.loadInitialStats();
    this.checkAuth();
    console.log('HOST DASHBOARD AI v9999.9 — ACTIVE');
  },

  checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Login required');
      window.location = '../auth/login.html';
    }
  },

  initSocket() {
    this.socket = io(this.API_URL, { 
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') }
    });

    this.socket.on('connect', () => {
      this.showWidget('AI Dashboard Live', 'success');
    });

    this.socket.on('stats_update', (data) => {
      this.updateStats(data);
    });

    this.socket.on('ai_insight', (insight) => {
      this.addInsight(insight);
    });

    this.socket.on('new_booking', (booking) => {
      this.showNotification(`New booking: ${booking.guest} → $${booking.total}`);
    });
  },

  loadInitialStats() {
    fetch(`${this.API_URL}/api/host-stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => this.updateStats(data))
      .catch(() => this.showWidget('Offline Mode', 'error'));
  },

  updateStats(data) {
    this.stats = data;
    document.getElementById('bookings-count').textContent = data.bookings;
    document.getElementById('revenue-total').textContent = `$${dataATEGORY.revenue.toLocaleString()}`;
    document.getElementById('owner-profit').textContent = `$${data.profit.toLocaleString()}`;
  },

  addInsight(insight) {
    const container = document.getElementById('ai-insights');
    const div = document.createElement('div');
    div.className = 'flex items-start gap-3 text-gray-300 animate-fadeIn';
    div.innerHTML = `
      <i class="fas fa-sparkles text-purple-400 mt-1"></i>
      <p><strong>${insight.title}</strong> → ${insight.message}</p>
    `;
    container.prepend(div);
    setTimeout(() => div.remove(), 10000);
  },

  showWidget(message, type = 'info') {
    const widget = document.getElementById('chat-widget');
    const colors = { success: '#10b981', info: '#06b6d4', error: '#ef4444', alert: '#f59e0b' };
    widget.innerHTML = `
      <div class="p-3 rounded-lg shadow-xl text-white text-sm font-medium flex items-center gap-2"
           style="background: ${colors[type]}; animation: pulse 2s infinite;">
        <i class="fas fa-brain"></i> ${message}
      </div>`;
    setTimeout(() => widget.innerHTML = '', 4000);
  },

  showNotification(msg) {
    const notif = document.createElement('div');
    notif.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-xl shadow-2xl z-50 animate-fadeIn';
    notif.innerHTML = `<i class="fas fa-bell"></i> ${msg}`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 5000);
  }
};

// GLOBAL & INIT
window.HOST_DASHBOARD = HOST_DASHBOARD;
document.addEventListener('DOMContentLoaded', () => HOST_DASHBOARD.init());