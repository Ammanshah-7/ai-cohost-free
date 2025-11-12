// pages/payments/payments.js — v9999.9 | UNIFIED CURRENCY + PAYMENT
const PAYMENTS = {
  BASE_USD: 897,
  RATES: { USD: 1, PKR: 278.5, EUR: 0.92, GBP: 0.79, AED: 3.67, SAR: 3.75, INR: 84 },
  SYMBOLS: { USD: '$', PKR: '₨', EUR: '€', GBP: '£', AED: 'د.إ', SAR: 'ر.س', INR: '₹' },

  init() {
    this.updateCurrency();
    this.bindCurrency();
    this.showWelcome();
  },

  bindCurrency() {
    const select = document.getElementById('currency-select');
    if (!select) return;

    select.addEventListener('change', () => {
      this.updateCurrency();
      this.showWidget(`Switched to ${select.value}`, 'info');
    });
  },

  updateCurrency() {
    const select = document.getElementById('currency-select');
    const totalEl = document.getElementById('total-amount');
    if (!select || !totalEl) return;

    const curr = select.value;
    const amount = this.BASE_USD * this.RATES[curr];
    totalEl.innerHTML = `${this.SYMBOLS[curr]}${Math.round(amount).toLocaleString()}`;
  },

  showWidget(msg, type = 'info') {
    const widget = document.getElementById('chat-widget');
    if (!widget) return;

    const colors = { success: '#10b981', error: '#ef4444', info: '#06b6d4' };
    widget.innerHTML = `
      <div class="p-3 rounded-lg text-white text-sm font-bold shadow-xl animate-bounce" 
           style="background: ${colors[type]}">
        ${msg}
      </div>`;
    setTimeout(() => widget.innerHTML = '', 3000);
  },

  showWelcome() {
    setTimeout(() => this.showWidget('Checkout Ready • AI Secure', 'success'), 1000);
  }
};

// GLOBAL & INIT
window.PAYMENTS = PAYMENTS;
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('currency-select')) {
    PAYMENTS.init();
  }
});