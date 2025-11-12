// currency.js — v9999.9 | AI-POWERED | LIVE RATES | SELF-HEALING
const CURRENCY = {
  // Static fallback rates (USD base)
  FALLBACK_RATES: { USD: 1, PKR: 278.5, EUR: 0.92, GBP: 0.79, AED: 3.67, SAR: 3.75, INR: 84 },
  SYMBOLS: { USD: '$', PKR: '₨', EUR: '€', GBP: '£', AED: 'د.إ', SAR: 'ر.س', INR: '₹' },

  // Live API (free, reliable, no key)
  API_URL: 'https://api.exchangerate-api.com/v4/latest/USD',

  baseUSD: 897, // 3 nights × $299
  rates: {},
  current: 'USD',

  init() {
    this.loadRates()
      .then(() => this.updateDisplay())
      .catch(() => {
        console.warn('CURRENCY: Using fallback rates');
        this.rates = this.FALLBACK_RATES;
        this.updateDisplay();
      });

    this.bindEvents();
    this.showWidget('Currency Engine Ready');
  },

  async loadRates() {
    try {
      const res = await fetch(this.API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.rates = { USD: 1, ...data.rates };
      console.log('CURRENCY: Live rates loaded');
    } catch (err) {
      throw err;
    }
  },

  bindEvents() {
    const select = document.getElementById('currency-select');
    if (!select) return;

    select.addEventListener('change', (e) => {
      this.current = e.target.value;
      this.updateDisplay();
      this.showWidget(`${SYMBOLS[this.current]}${this.format(this.baseUSD * this.rates[this.current])}`, 'success');
    });

    // Auto-convert on load
    document.addEventListener('DOMContentLoaded', () => this.updateDisplay());
  },

  updateDisplay() {
    const totalEl = document.getElementById('total-amount');
    if (!totalEl) return;

    const rate = this.rates[this.current] || this.FALLBACK_RATES[this.current] || 1;
    const amount = this.baseUSD * rate;
    totalEl.innerHTML = `
      <span class="text-3xl font-bold">${this.SYMBOLS[this.current]}${this.format(amount)}</span>
      <span class="text-sm text-gray-400 ml-2">(${this.current})</span>
    `;

    // Animate change
    totalEl.classList.add('animate-pulse');
    setTimeout(() => totalEl.classList.remove('animate-pulse'), 600);
  },

  format(num) {
    return Math.round(num).toLocaleString();
  },

  showWidget(msg, type = 'info') {
    const widget = document.getElementById('chat-widget');
    if (!widget) return;

    const colors = { success: '#10b981', info: '#06b6d4', error: '#ef4444' };
    widget.innerHTML = `
      <div class="p-3 rounded-lg text-white text-sm font-bold shadow-xl animate-bounce" 
           style="background: ${colors[type]}">
        ${msg}
      </div>`;
    setTimeout(() => widget.innerHTML = '', 2500);
  }
};

// GLOBAL & INIT
window.CURRENCY = CURRENCY;
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('currency-select') && document.getElementById('total-amount')) {
    CURRENCY.init();
  }
});