// pages/search/results.js — v9999.9 | AI SEARCH
const SEARCH = {
  properties: [
    { id: 'villa-dubai-001', title: 'Luxury Villa Dubai', location: 'Dubai', price: 299, type: 'villa', img: '../assets/villa-main.jpg' },
    { id: 'apt-lahore-002', title: 'Modern Apartment', location: 'Lahore', price: 89, type: 'apartment', img: '../assets/apt.jpg' },
    { id: 'villa-karachi-003', title: 'Beach Villa', location: 'Karachi', price: 450, type: 'villa', img: '../assets/beach.jpg' }
  ],

  init() {
    this.renderResults();
    this.showWelcome();
  },

  renderResults(filter = 'all') {
    const grid = document.getElementById('results-grid');
    const noResults = document.getElementById('no-results');
    let filtered = this.properties;

    if (filter !== 'all') {
      filtered = this.properties.filter(p => p.type === filter || p.location.toLowerCase().includes(filter));
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      noResults.classList.remove('hidden');
      return;
    }

    noResults.classList.add('hidden');
    grid.innerHTML = filtered.map(p => `
      <div class="property-card" onclick="goToProperty('${p.id}')">
        <img src="${p.img}" alt="${p.title}" class="property-img">
        <div class="property-info">
          <h3 class="property-title">${p.title}</h3>
          <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${p.location}</p>
          <p class="property-price">$${p.price}/night</p>
          <div class="property-tags">
            <span class="tag">${p.type}</span>
          </div>
        </div>
      </div>
    `).join('');
  },

  showWelcome() {
    setTimeout(() => this.showWidget('Search Results Loaded', 'success'), 800);
  },

  showWidget(msg, type = 'info') {
    const widget = document.getElementById('chat-widget');
    if (!widget) return;
    const colors = { success: '#10b981', info: '#06b6d4' };
    widget.innerHTML = `<div class="p-3 rounded-lg text-white text-sm font-bold" style="background: ${colors[type]}">${msg}</div>`;
    setTimeout(() => widget.innerHTML = '', 3000);
  }
};

function filter(type) {
  SEARCH.renderResults(type);
}

function goToProperty(id) {
  window.location.href = `../properties/property-view.html?id=${id}`;
}

window.SEARCH = SEARCH;
document.addEventListener('DOMContentLoaded', () => SEARCH.init());