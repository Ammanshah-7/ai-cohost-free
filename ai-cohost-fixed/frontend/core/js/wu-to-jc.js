// pages/payments/ai/wu-to-jc.js — v9999.9 | WU → JAZZCASH | AI FRAUD + TAX + CURRENCY
const WU = {
  API_URL: 'https://syedcohost.onrender.com',
  CURRENCY_API: 'https://api.exchangerate-api.com/v4/latest/USD',
  TAX_RATES: { gst: 0.17, income_tax: 0.05 },

  // AI Fraud Rules
  fraudRules: {
    maxMTCNAttempts: 3,
    blacklistedMTCNs: ['1234567890', '1111111111'],
    suspiciousIPs: ['192.168.1.1']
  },

  attempts: 0,

  init() {
    this.bindButton();
    this.showSecurityBadge();
  },

  bindButton() {
    document.getElementById('pay-wu')?.addEventListener('click', () => this.payWesternUnion());
  },

  async payWesternUnion() {
    if (this.attempts >= this.fraudRules.maxMTCNAttempts) {
      this.blockPayment('Too many attempts. Try again later.');
      return;
    }

    const mtcn = this.showMTCNModal();
    if (!mtcn) return;

    const fraudScore = await this.runFraudCheck(mtcn);
    if (fraudScore > 70) {
      this.blockPayment('AI Fraud Alert: Suspicious MTCN');
      return;
    }

    const amountUSD = 897;
    const taxData = this.calculateTax(amountUSD);
    const totalPKR = await this.convertToPKR(amountUSD + taxData.totalTax);

    this.showLoader('Verifying MTCN with Western Union...');

    fetch(`${this.API_URL}/api/wu-to-jazzcash`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ 
        mtcn, 
        amount_usd: amountUSD,
        tax: taxData,
        fraudScore
      })
    })
    .then(r => r.json())
    .then(d => {
      this.hideLoader();
      if (d.success) {
        this.showSuccess(d, totalPKR, mtcn);
        this.attempts = 0;
      } else {
        this.attempts++;
        this.showError(d.error || 'Invalid MTCN');
      }
    })
    .catch(() => {
      this.hideLoader();
      this.showError('Network error. Try again.');
    });
  },

  showMTCNModal() {
    const modal = this.createModal();
    let mtcn = '';

    modal.innerHTML = `
      <div class="p-6 bg-gray-900 rounded-xl max-w-sm w-full">
        <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <i class="fas fa-globe text-cyan-400"></i> Western Union
        </h3>
        <input 
          type="text" 
          placeholder="Enter 10-digit MTCN" 
          maxlength="10"
          class="w-full px-4 py-3 bg-gray-800 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-4"
          id="mtcn-input"
        />
        <div class="flex gap-3">
          <button id="submit-mtcn" class="neural-btn flex-1">Submit</button>
          <button onclick="this.closest('.modal').remove()" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex-1">Cancel</button>
        </div>
      </div>`;

    document.body.appendChild(modal);

    return new Promise(resolve => {
      document.getElementById('submit-mtcn').onclick = () => {
        mtcn = document.getElementById('mtcn-input').value.trim();
        if (mtcn.length !== 10 || !/^/d+$/.test(mtcn)) {
          this.showWidget('MTCN must be 10 digits', 'error');
          return;
        }
        modal.remove();
        resolve(mtcn);
      };
    });
  },

  async runFraudCheck(mtcn) {
    let score = 0;

    // Rule 1: Blacklisted MTCN
    if (this.fraudRules.blacklistedMTCNs.includes(mtcn)) score += 100;

    // Rule 2: Pattern (repeating digits)
    if (/^(/d)/1+$/.test(mtcn)) score += 60;

    // Rule 3: IP
    const ip = await this.getIP();
    if (this.fraudRules.suspiciousIPs.includes(ip)) score += 40;

    // Rule 4: Velocity
    const last = localStorage.getItem('last_wu_time');
    if (last && Date.now() - last < 300000) score += 30;

    localStorage.setItem('last_wu_time', Date.now());

    // AI Simulation
    score += Math.random() * 15;

    console.log(`WU Fraud Score: ${score.toFixed(1)}%`);
    return Math.min(score, 100);
  },

  async getIP() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      return (await res.json()).ip;
    } catch {
      return '0.0.0.0';
    }
  },

  calculateTax(amountUSD) {
    const gst = amountUSD * this.TAX_RATES.gst;
    const incomeTax = amountUSD * this.TAX_RATES.income_tax;
    return { gst, incomeTax, totalTax: gst + incomeTax };
  },

  async convertToPKR(amountUSD) {
    try {
      const res = await fetch(this.CURRENCY_API);
      const data = await res.json();
      return Math.round(amountUSD * data.rates.PKR);
    } catch {
      return Math.round(amountUSD * 278.5);
    }
  },

  showSuccess(data, totalPKR, mtcn) {
    const modal = this.createModal();
    modal.innerHTML = `
      <div class="p-6 text-center">
        <i class="fas fa-check-circle text-green-400 text-6xl mb-4"></i>
        <h3 class="text-2xl font-bold text-white mb-2">WU → JazzCash Success!</h3>
        <div class="bg-gray-800 rounded-lg p-4 mt-4 text-left text-sm">
          <p><strong>MTCN:</strong> ${mtcn}</p>
          <p><strong>Amount:</strong> $${data.amount_usd} → ₨${totalPKR.toLocaleString()}</p>
          <p><strong>JazzCash IBAN:</strong> ${data.iban}</p>
          <p><strong>Account:</strong> ${data.account_name}</p>
          <p class="text-green-400 mt-2"><strong>Status: Deposited in PKR</strong></p>
        </div>
        <button onclick="this.closest('.modal').remove()" class="mt-6 neural-btn">
          Done
        </button>
      </div>`;
    document.body.appendChild(modal);
    this.showWidget('WU Payment Successful!', 'success');
  },

  showError(msg) {
    this.showWidget(msg, 'error');
  },

  blockPayment(reason) {
    this.showWidget(reason, 'error');
    document.body.style.filter = 'blur(4px)';
    setTimeout(() => document.body.style.filter = '', 2000);
  },

  showLoader(msg) {
    const loader = document.createElement('div');
    loader.id = 'wu-loader';
    loader.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div class="bg-gray-900 p-6 rounded-xl text-center">
          <i class="fas fa-spinner fa-spin text-cyan-400 text-4xl mb-4"></i>
          <p class="text-white font-bold">${msg}</p>
        </div>
      </div>`;
    document.body.appendChild(loader);
  },

  hideLoader() {
    document.getElementById('wu-loader')?.remove();
  },

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4';
    modal.onclick = (e) => e.target === modal && modal.remove();
    return modal;
  },

  showWidget(msg, type = 'info') {
    const widget = document.getElementById('chat-widget');
    if (!widget) return;

    const colors = { success: '#10b981', error: '#ef4444', info: '#06b6d4' };
    widget.innerHTML = `
      <div class="p-3 rounded-lg text-white text-sm font-bold shadow-xl animate-bounce" 
           style="background: ${colors[type]}">
        <i class="fas fa-shield-alt"></i> ${msg}
      </div>`;
    setTimeout(() => widget.innerHTML = '', 4000);
  },

  showSecurityBadge() {
    const badge = document.createElement('div');
    badge.innerHTML = `<i class="fas fa-shield-alt"></i> AI Fraud Protection Active`;
    badge.className = 'fixed bottom-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-40';
    document.body.appendChild(badge);
  }
};

// GLOBAL & INIT
window.WU = WU;
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('pay-wu')) {
    WU.init();
  }
});