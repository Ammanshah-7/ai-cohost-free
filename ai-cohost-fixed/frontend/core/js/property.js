// pages/properties/property.js — v9999.9 | AI BOOKING + CURRENCY + TAX + VR
const PROPERTY = {
  // PROPERTY DATA
  basePrice: 299,
  propertyId: 'villa-dubai-001',
  title: 'Luxury Villa Dubai',
  currency: 'USD',
  taxRate: 0.22, // 17% GST + 5% IT

  // LIVE RATES
  RATES: { USD: 1, PKR: 278.5, EUR: 0.92, GBP: 0.79, AED: 3.67, SAR: 3.75, INR: 84 },
  SYMBOLS: { USD: '$', PKR: '₨', EUR: '€', GBP: '£', AED: 'د.إ', SAR: 'ر.س', INR: '₹' },

  init() {
    this.bindButtons();
    this.initCurrency();
    this.loadLiveRates();
    this.showWelcome();
    this.autoVR();
  },

  bindButtons() {
    document.getElementById('book-now')?.addEventListener('click', () => this.bookNow());
    document.getElementById('vr-tour')?.addEventListener('click', () => this.startVR());
  },

  async bookNow() {
    const modal = this.createBookingModal();
    document.body.appendChild(modal);
  },

  createBookingModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4';
    modal.onclick = (e) => e.target === modal && modal.remove();

    const nights = 3;
    const subtotal = this.basePrice * nights;
    const tax = subtotal * this.taxRate;
    const total = subtotal + tax;

    modal.innerHTML = `
      <div class="quantum-card p-6 max-w-md w-full">
        <h3 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <i class="fas fa-calendar-check text-cyan-400"></i> Book Your Stay
        </h3>

        <div class="space-y-4">
          <div>
            <label class="text-sm text-gray-300">Nights</label>
            <input type="number" id="nights-input" value="${nights}" min="1" max="30" 
                   class="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg text-white">
          </div>

          <div>
            <label class="text-sm text-gray-300">Guests</label>
            <input type="number" id="guests-input" value="2" min="1" max="12" 
                   class="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg text-white">
          </div>

          <div class="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
            <div class="flex justify-between"><span>Subtotal</span><span id="subtotal">$${subtotal}</span></div>
            <div class="flex justify-between"><span>Tax (22%)</span><span id="tax">$${tax.toFixed(0)}</span></div>
            <div class="flex justify-between font-bold text-lg text-cyan-400">
              <span>Total</span><span id="total">$${total.toFixed(0)}</span>
            </div>
          </div>

          <div class="flex gap-3">
            <button id="confirm-booking" class="neural-btn primary flex-1">
              <i class="fas fa-lock"></i> Confirm & Pay
            </button>
            <button onclick="this.closest('.modal').remove()" class="neural-btn ghost flex-1">
              Cancel
            </button>
          </div>
        </div>
      </div>`;

    modal.querySelector('#nights-input').addEventListener('input', () => this.updatePricing(modal));
    modal.querySelector('#guests-input').addEventListener('input', () => this.updatePricing(modal));
    modal.querySelector('#confirm-booking').addEventListener('click', () => this.confirmBooking(modal));

    return modal;
  },

  updatePricing(modal) {
    const nights = parseInt(modal.querySelector('#nights-input').value) || 1;
    const subtotal = this.basePrice * nights;
    const tax = subtotal * this.taxRate;
    const total = subtotal + tax;

    modal.querySelector('#subtotal').textContent = `$${subtotal}`;
    modal.querySelector('#tax').textContent = `$${tax.toFixed(0)}`;
    modal.querySelector('#total').textContent = `$${total.toFixed(0)}`;
  },

  confirmBooking(modal) {
    const nights = modal.querySelector('#nights-input').value;
    const guests = modal.querySelector('#guests-input').value;
    const total = modal.querySelector('#total').textContent;

    const url = `../payments/checkout.html?nights=${nights}&guests=${guests}&total=${total.replace('$', '')}&property=${this.propertyId}&title=${encodeURIComponent(this.title)}`;

    this.showWidget(`Redirecting to secure checkout... ${total}`, 'success');
    modal.remove();
    setTimeout(() => window.location.href = url, 1500);
  },

  startVR() {
    if (typeof VR_TOUR !== 'undefined' && VR_TOUR.start) {
      VR_TOUR.start();
      this.showWidget('360° VR Tour Activated', 'success');
    } else {
      this.showWidget('Loading VR Engine...', 'info');
      const script = document.createElement('script');
      script.src = 'ai/virtual-tour.js';
      script.onload = () => {
        VR_TOUR.start();
        this.showWidget('VR Tour Ready', 'success');
      };
      document.head.appendChild(script);
    }
  },

  async loadLiveRates() {
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await res.json();
      Object.keys(this.RATES).forEach(curr => {
        if (data.rates[curr]) this.RATES[curr] = data.rates[curr];
      });
      this.updateAllPrices();
    } catch (err) {
      console.warn('Live rates failed, using fallback');
    }
  },

  initCurrency() {
    const select = document.createElement('select');
    select.id = 'price-currency';
    select.className = 'neural-btn ghost text-sm px-3 py-1 ml-2';

    Object.keys(this.SYMBOLS).forEach(curr => {
      const opt = document.createElement('option');
      opt.value = curr;
      opt.textContent = curr;
      if (curr === 'USD') opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      this.currency = e.target.value;
      this.updateAllPrices();
      this.showWidget(`Price in ${this.currency}`, 'info');
    });

    // Insert next to price
    const priceEl = document.querySelector('.booking-price');
    if (priceEl) priceEl.parentNode.appendChild(select);
  },

  updateAllPrices() {
    const rate = this.RATES[this.currency];
    const symbol = this.SYMBOLS[this.currency];
    const price = Math.round(this.basePrice * rate);

    const priceEl = document.querySelector('.booking-price');
    if (priceEl) priceEl.textContent = `${symbol}${price}`;

    document.querySelectorAll('[data-base-price]').forEach(el => {
      const base = parseFloat(el.dataset.basePrice);
      el.textContent = `${symbol}${Math.round(base * rate).toLocaleString()}`;
    });
  },

  autoVR() {
    if (window.location.search.includes('vr=1')) {
      setTimeout(() => this.startVR(), 1500);
    }
  },

  showWidget(msg, type = 'info') {
    const widget = document.getElementById('chat-widget');
    if (!widget) return;

    const colors = { success: '#10b981', error: '#ef4444', info: '#06b6d4' };
    widget.innerHTML = `
      <div class="p-3 rounded-lg text-white text-sm font-bold shadow-xl animate-bounce" 
           style="background: ${colors[type]}">
        <i class="fas fa-brain"></i> ${msg}
      </div>`;
    setTimeout(() => widget.innerHTML = '', 3000);
  },

  showWelcome() {
    setTimeout(() => this.showWidget('AI-Powered Booking • Ready', 'success'), 1000);
  }
};

// GLOBAL & INIT
window.PROPERTY = PROPERTY;
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.quantum-card')) {
    PROPERTY.init();
  }
});