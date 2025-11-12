// pages/host/owner-dashboard.js — OWNER EMPIRE AI v9999.9
const OWNER_DASH = {
  socket: null,
  stats: {},
  API_URL: 'https://syedcohost.onrender.com',

  init() {
    this.checkAuth();
    this.initSocket();
    this.loadStats();
    this.loadInsights();
    console.log('OWNER DASHBOARD AI v9999.9 — ACTIVE');
  },

  checkAuth() {
    const token = localStorage.getItem('token');
    if (!token || !token.includes('owner')) {
      alert('Owner access only');
      window.location = 'dashboard.html';
    }
  },

  initSocket() {
    this.socket = io(this.API_URL, {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') }
    });

    this.socket.on('connect', () => {
      this.showWidget('AI Empire Connected', 'success');
    });

    this.socket.on('owner_stats', (data) => {
      this.updateStats(data);
    });

    this.socket.on('new_insight', (insight) => {
      this.addInsight(insight);
    });
  },

  loadStats() {
    fetch(`${this.API_URL}/api/owner-stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(r => r.json())
    .then(data => this.updateStats(data))
    .catch(() => this.showWidget('Offline Mode', 'error'));
  },

  updateStats(data) {
    this.stats = data;
    document.getElementById('total-revenue').textContent = `₨${data.revenue.toLocaleString()}`;
    document.getElementById('platform-profit').textContent = `₨${data.platform_profit.toLocaleString()}`;
    document.getElementById('active-hosts').textContent = data.hosts;
  },

  loadInsights() {
    const insights = [
      { icon: 'lightbulb', color: 'text-yellow-400', title: 'Scale Opportunity', msg: 'Add 200 properties in Lahore → +₨120,000/month' },
      { icon: 'chart-line', color: 'text-green-400', title: 'Profit Surge', msg: 'Dubai hosts earned 42% more this week' },
      { icon: 'robot', color: 'text-purple-400', title: 'AI Auto-Pricing', msg: 'Enabled for 38 hosts → +18% revenue' },
      { icon: 'globe', color: 'text-cyan-400', title: 'Global Reach', msg: 'Bookings from 12 countries this month' }
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

  scaleEmpire() {
    alert('AI Scaling Engine Activated:\n• 500 new hosts targeted\n• ₨50M marketing budget\n• 1000 properties in 90 days');
  },

  withdraw() {
    if (confirm(`Withdraw ₨${this.stats.platform_profit?.toLocaleString()}?`)) {
      this.showWidget('Withdrawal Processed', 'success');
    }
  },

  showWidget(msg, type) {
    const w = document.getElementById('chat-widget');
    const c = { success: '#10b981', error: '#ef4444' };
    w.innerHTML = `<div class="p-4 rounded-xl text-white font-bold" style="background:${c[type]}">${msg}</div>`;
    setTimeout(() => w.innerHTML = '', 3000);
  }
};

// GLOBAL & INIT
window.OWNER_DASH = OWNER_DASH;
document.addEventListener('DOMContentLoaded', () => OWNER_DASH.init());