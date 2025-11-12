// pages/host/list.js — AI LISTING ENGINE v9999.9
const LISTING = {
  socket: null,
  API_URL: 'https://syedcohost.onrender.com',

  init() {
    this.initSocket();
    this.bindEvents();
  },

  initSocket() {
    this.socket = io(this.API_URL, { transports: ['websocket'] });
    this.socket.on('connect', () => console.log('Listing AI Connected'));
  },

  bindEvents() {
    document.getElementById('list-form').onsubmit = (e) => this.submit(e);
    document.getElementById('ai-price-btn').onclick = () => this.aiPricing();
    document.getElementById('images').onchange = (e) => this.previewImages(e);
  },

  aiPricing() {
    const title = document.querySelector('[name="title"]').value;
    const location = document.querySelector('[name="location"]').value;
    if (!title || !location) return this.showWidget('Enter title & location', 'error');

    this.showWidget('AI calculating price...', 'thinking');
    fetch(`${this.API_URL}/api/ai-pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, location })
    })
    .then(r => r.json())
    .then(data => {
      document.querySelector('[name="price"]').value = data.price;
      this.showWidget(`AI suggests $${data.price}/night`, 'success');
    })
    .catch(() => this.showWidget('AI offline', 'error'));
  },

  previewImages(e) {
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';
    Array.from(e.target.files).slice(0, 10).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = document.createElement('img');
        img.src = ev.target.result;
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  },

  submit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const token = localStorage.getItem('token');
    if (!token) return alert('Login required');

    this.showWidget('Uploading...', 'thinking');
    fetch(`${this.API_URL}/api/list-property`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        this.showWidget('Listed!', 'success');
        setTimeout(() => window.location = 'dashboard.html', 1500);
      } else {
        alert(data.error);
      }
    })
    .catch(() => this.showWidget('Network error', 'error'));
  },

  showWidget(msg, type) {
    const w = document.getElementById('chat-widget');
    const c = { success: '#10b981', thinking: '#a855f7', error: '#ef4444' };
    w.innerHTML = `<div class="p-3 rounded-lg text-white text-sm" style="background:${c[type]}">${msg}</div>`;
    setTimeout(() => w.innerHTML = '', 3000);
  }
};

// INIT
document.addEventListener('DOMContentLoaded', () => LISTING.init());