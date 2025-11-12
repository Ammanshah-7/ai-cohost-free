// pages/payments/ai/fraud-detection.js — v9999.9 | AI FRAUD + TAX + CURRENCY
const FRAUD = {
  API_URL: 'https://syedcohost.onrender.com',
  CURRENCY_API: 'https://api.exchangerate-api.com/v4/latest/USD',
  TAX_RATES: { gst: 0.17, income_tax: 0.05 },

  // AI Fraud Rules
  fraudRules: {
    maxAmount: 5000,
    suspiciousIPs: ['192.168.1.1', '10.0.0.1'],
    blacklistedCards: ['4111111111111111']
  },

  init() {
    this.bindPaymentButtons();
    this.loadLiveRates();
    this.showSecurityBadge();
  },

  bindPaymentButtons() {
    document.getElementById('pay-jazzcash')?.addEventListener('click', () => this.payJazzCash());
    document.getElementById('pay-crypto')?.addEventListener('click', () => this.payCrypto());
  },

  async payJazzCash() {
    const amountUSD = 897;
    const fraudScore = await this.runFraudCheck(amountUSD);
    
    if (fraudScore > 70) {
      this.blockPayment('AI Fraud Alert: High Risk');
      return;
    }

    const taxData = this.calculateTax(amountUSD);
    const totalPKR = await this.convertToPKR(amountUSD + taxData.totalTax);

    this.showLoader('Processing with JazzCash...');

    fetch(`${this.API_URL}/api/process-payment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ 
        amount: amountUSD, 
        currency: 'USD',
        tax: taxData,
        fraudScore 
      })
    })
    .then(r => r.json())
    .then(d => {
      this.hideLoader();
      if (d.success) {
        this.showSuccess(d, totalPKR);
      } else {
        this.showError(d.error || 'Payment failed');
      }
    })
    .catch(() => {
      this.hideLoader();
      this.showError('Network error. Try again.');
    });
  },

  async payCrypto() {
    const amountUSD = 897;
    const fraudScore = await this.runFraudCheck(amountUSD);
    
    if (fraudScore > 60) {
      this.blockPayment('Crypto Fraud Detected');
      return;
    }

    const txid = '0x' + Math.random().toString(16).substr(2, 64);
    const wallet = 'bc1qsyedai' + Math.random().toString(36).substr(2, 9);

    this.showCryptoModal({
      txid,
      wallet,
      amount: amountUSD,
      usd: amountUSD,
      btc: (amountUSD / 65000).toFixed(6)
    });
  },

  async runFraudCheck(amount) {
    let score = 0;

    // Rule 1: Amount
    if (amount > this.fraudRules.maxAmount) score += 50;

    // Rule 2: Card (mock)
    const card = document.getElementById('card-number')?.value;
    if (card && this.fraudRules.blacklistedCards.includes(card.replace(/\s/g, ''))) {
      score += 100;
    }

    // Rule 3: IP (mock)
    const ip = await this.getIP();
    if (this.fraudRules.suspiciousIPs.includes(ip)) score += 40;

    // Rule 4: Velocity (mock)
    const lastPayment = localStorage.getItem('last_payment_time');
    if (lastPayment && Date.now() - lastPayment < 300000) score += 30; // 5 min

    localStorage.setItem('last_payment_time', Date.now());

    // AI Simulation
    score += Math.random() * 20;

    console.log(`AI Fraud Score: ${score.toFixed(1)}%`);
    return Math.min(score, 100);
  },

  async getIP() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch {
      return '0.0.0.0';
    }
  },

  calculateTax(amountUSD) {
    const gst = amountUSD * this.TAX_RATES.gst;
    const incomeTax = amountUSD * this.TAX_RATES.income_tax;
    const totalTax = gst + incomeTax;
    return { gst, incomeTax, totalTax };
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

  showSuccess(data, totalPKR) {
    const modal = this.createModal();
    modal.innerHTML = `
      <div class="p-6 text-center">
        <i class="fas fa-check-circle text-green-400 text-6xl mb-4"></i>
        <h3 class="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
        <div class="bg-gray-800 rounded-lg p-4 mt-4 text-left text-sm">
          <p><strong>Host Share (70%):</strong> $${data.host_share}</p>
          <p><strong>Platform (30%):</strong> $${data.platform_share}</p>
          <p><strong>Total (incl. tax):</strong> ₨${totalPKR.toLocaleString()}</p>
          <hr class="my-3 border-gray-700">
          <p><strong>IBAN:</strong> ${data.iban}</p>
          <p><strong>Account:</strong> ${data.account_name}</p>
        </div>
        <button onclick="this.closest('.modal').remove()" class="mt-6 neural-btn">
          Close
        </button>
      </div>`;
    document.body.appendChild(modal);
  },

  showCryptoModal(data) {
    const modal = this.createModal();
    modal.innerHTML = `
      <div class="p-6 text-center">
        <i class="fab fa-bitcoin text-yellow-400 text-6xl mb-4"></i>
        <h3 class="text-2xl font-bold text-white mb-2">Send Crypto</h3>
        <div class="bg-gray-800 rounded-lg p-4 mt-4 text-left text-sm font-mono">
          <p><strong>Wallet:</strong> <span class="text-cyan-400">${data.wallet}</span></p>
          <p><strong>Amount:</strong> ${data.btc} BTC (~$${data.usd})</p>
          <p><strong>TxID:</strong> <span class="text-green-400">${data.txid}</span></p>
        </div>
        <button onclick="navigator.clipboard.writeText('${data.wallet}'); alert('Wallet copied!')" 
                class="mt-4 px-4 py-2 bg-cyan-600 rounded-lg text-white">
          Copy Wallet
        </button>
      </div>`;
    document.body.appendChild(modal);
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
    loader.id = 'payment-loader';
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
    document.getElementById('payment-loader')?.remove();
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

  async loadLiveRates() {
    // Optional: display live rates
  },

  showSecurityBadge() {
    const badge = document.createElement('div');
    badge.innerHTML = `<i class="fas fa-shield-alt"></i> AI Fraud Protection Active`;
    badge.className = 'fixed bottom-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-40';
    document.body.appendChild(badge);
  }
};

// GLOBAL & INIT
window.FRAUD = FRAUD;
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('pay-jazzcash') || document.getElementById('pay-crypto')) {
    FRAUD.init();
  }
});