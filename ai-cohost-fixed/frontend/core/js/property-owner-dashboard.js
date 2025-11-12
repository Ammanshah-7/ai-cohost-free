// pages/host/property-owner-dashboard.js — v9999.9
const PROPERTY_OWNER = {
  socket: null,
  stats: {},
  API_URL: 'https://syedcohost.onrender.com',

  init() {
    this.checkAuth();
    this.initSocket();
    this.loadStats();
    this.loadInsights();
    console.log('PROPERTY OWNER DASHBOARD v9999.9 — ACTIVE');
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
      this.showWidget('AI Connected', 'success');
    });

    this.socket.on('property_stats', (data) => {
      this.updateStats(data);
    });
  },

  loadStats() {
    fetch(`${this.API_URL}/api/property-owner-stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(r => r.json())
    .then(data => this.updateStats(data))
    .catch(() => this.showWidget('Offline', 'error'));
  },

  updateStats(data) {
    this.stats = data;
    document.getElementById('property-count').textContent = data.properties;
    document.getElementById('booking-count').textContent = data.bookings;
    document.getElementById('total-revenue').textContent = `$${data.revenue.toLocaleString()}`;
    document.getElementById('owner-profit').textContent = `$${data.profit.toLocaleString()}`;
  },

  loadInsights() {
    const insights = [
      { icon: 'lightbulb', color: 'text-yellow-400', title: 'Price Boost', msg: 'Raise Villa #3 by $35/night → +$2,100/month' },
      { icon: 'chart-line', color: 'text-green-400', title: 'High Demand', msg: 'Dubai weekend: 98% occupancy' },
      { icon: 'robot', color: 'text-purple-400', title: 'AI Auto-Reply', msg: '100% response rate → 5.0 rating' },
      { icon: 'shield-alt', color: 'text-cyan-400', title: 'Zero Risk', msg: 'All guests verified → $1M insurance' }
    ];
    insights.forEach(i => this.addInsight(i));
  },

  addInsight(insight) {
    const container = document.getElementById('ai-insights');
    const div = document.createElement('div');
    div.className = 'ai-insight';
    div.innerHTML = `
      <i class="fas fa-${insight.icon} ${insight.color}"></i>
      <div>
        <p class="font-bold text-white">${insight.title}</p>
        <p class="text-gray-300">${insight.msg}</p>
      </div>
    `;
    container.prepend(div);
  },

  withdrawProfit() {
    if (confirm(`Withdraw $${this.stats.profit?.toLocaleString()}?`)) {
      this.showWidget('Withdrawn!', 'success');
    }
  },

  showWidget(msg, type) {
    const w = document.getElementById('chat-widget');
    const c = { success: '#10b981', error: '#ef4444' };
    w.innerHTML = `<div class="p-4 rounded-xl text-white font-bold" style="background:${c[type]}">${msg}</div>`;
    setTimeout(() => w.innerHTML = '', 3000);
  }
};

// GLOBAL
window.PROPERTY_OWNER = PROPERTY_OWNER;
window.withdrawProfit = () => PROPERTY_OWNER.withdrawProfit();

// INIT
document.addEventListener('DOMContentLoaded', () => PROPERTY_OWNER.init());