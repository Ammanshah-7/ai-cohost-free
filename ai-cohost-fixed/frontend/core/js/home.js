// pages/home/ai/neural-search.js — NEURAL SEARCH v9999.9
const NEURAL_SEARCH = {
  socket: null,
  recognition: null,
  isListening: false,
  properties: [],
  filters: {},
  API_URL: 'https://syedcohost.onrender.com',

  // === 1. INIT SOCKET.IO + VOICE ===
  init() {
    this.initSocket();
    this.initVoice();
    console.log('NEURAL SEARCH ENGINE v9999.9 — ACTIVE');
  },

  initSocket() {
    this.socket = io(this.API_URL, { 
      transports: ['websocket'], 
      reconnectionAttempts: 5 
    });

    this.socket.on('connect', () => {
      this.showStatus('AI Connected', 'success');
    });

    this.socket.on('search_results', (data) => this.handleResults(data));
    this.socket.on('ai_response', (data) => this.handleAIResponse(data));
    this.socket.on('error', (err) => this.showStatus('AI Error', 'error'));
  },

  // === 2. VOICE SEARCH TOGGLE ===
  toggleVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search not supported.');
      return;
    }

    if (this.isListening) {
      this.stopVoice();
    } else {
      this.startVoice();
    }
  },

  startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = true;
    this.recognition.continuous = true;

    const btn = document.getElementById('voice-search-btn');
    btn.innerHTML = '<i class="fas fa-stop"></i>';
    btn.classList.add('recording');
    this.isListening = true;

    this.showStatus('Listening... Speak your request', 'recording');

    this.recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('');
      document.getElementById('ai-input').value = transcript;
    };

    this.recognition.onerror = () => {
      this.stopVoice();
      this.showStatus('Voice Error', 'error');
    };

    this.recognition.start();
  },

  stopVoice() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }

    const btn = document.getElementById('voice-search-btn');
    btn.innerHTML = '<i class="fas fa-microphone"></i>';
    btn.classList.remove('recording');

    const query = document.getElementById('ai-input').value.trim();
    if (query) this.search(query);
  },

  // === 3. TRIGGER SEARCH ===
  search(query = null) {
    const input = query || document.getElementById('ai-input').value.trim();
    if (!input) return this.showStatus('Please speak or type', 'info');

    this.showStatus('AI is thinking...', 'thinking');
    document.getElementById('results').innerHTML = this.getLoadingHTML();

    this.socket.emit('ai_search', {
      query: input,
      filters: this.filters,
      timestamp: new Date().toISOString()
    });
  },

  // === 4. HANDLE AI RESULTS ===
  handleResults(data) {
    this.properties = data.properties || [];
    this.renderProperties();
    this.updateCount();
    this.showStatus(`${this.properties.length} properties found`, 'success');
  },

  handleAIResponse(data) {
    if (data.suggestion) {
      document.getElementById('ai-input').value = data.suggestion;
      this.showStatus('AI Suggestion Applied', 'info');
    }
  },

  // === 5. RENDER PROPERTIES ===
  renderProperties() {
    const grid = document.getElementById('results');
    if (!this.properties.length) {
      grid.innerHTML = this.getEmptyHTML();
      return;
    }

    grid.innerHTML = this.properties.map(p => `
      <div class="quantum-card p-6 rounded-2xl cursor-pointer group" onclick="NEURAL_SEARCH.view('${p.id}')">
        <div class="relative overflow-hidden rounded-xl mb-4">
          <img src="${p.image || '/static/images/properties/default.jpg'}" 
               alt="${p.title}" 
               class="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
          <div class="absolute top-3 right-3 bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            AI MATCH ${Math.round(p.score * 100)}%
          </div>
          <button class="absolute top-3 left-3 text-white opacity-80 hover:opacity-100 transition"
                  onclick="event.stopPropagation(); NEURAL_SEARCH.toggleFavorite('${p.id}')">
            <i class="far fa-heart text-xl"></i>
          </button>
        </div>
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-xl font-bold text-cyan-400 group-hover:text-cyan-300 transition">
            ${p.title}
          </h3>
          <div class="flex items-center gap-1 text-yellow-400">
            <i class="fas fa-star"></i>
            <span class="text-sm font-medium">${p.rating || '4.9'}</span>
            <span class="text-xs text-gray-400">(${p.reviews || 128})</span>
          </div>
        </div>
        <p class="text-gray-300 text-sm mb-2">${p.location}</p>
        <div class="flex items-center justify-between">
          <p class="text-2xl font-bold text-white">
            $${p.price}<span class="text-sm font-normal text-gray-400"> / night</span>
          </p>
          <button class="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
            View Details
          </button>
        </div>
      </div>
    `).join('');
  },

  // === 6. VIEW PROPERTY ===
  view(id) {
    localStorage.setItem('selectedProperty', id);
    window.location = '../property/view.html?id=' + id;
  },

  // === 7. FAVORITE TOGGLE ===
  toggleFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(id);
    if (index > -1) favorites.splice(index, 1);
    else favorites.push(id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    this.renderProperties(); // Re-render to update heart
  },

  // === 8. UPDATE COUNT ===
  updateCount() {
    const count = this.properties.length;
    document.querySelector('[data-count]')?.setAttribute('data-count', count);
  },

  // === 9. UI HELPERS ===
  getLoadingHTML() {
    return `
      <div class="col-span-full text-center py-20">
        <i class="fas fa-brain text-6xl text-cyan-400 animate-pulse"></i>
        <p class="mt-6 text-xl text-gray-300">AI is searching millions of properties...</p>
        <p class="mt-2 text-sm text-gray-500">Understanding: location, dates, budget, amenities...</p>
      </div>`;
  },

  getEmptyHTML() {
    return `
      <div class="col-span-full text-center py-20">
        <i class="fas fa-search text-5xl text-gray-500 mb-4"></i>
        <p class="text-xl text-gray-400">No properties found.</p>
        <p class="text-sm text-gray-500 mt-2">Try: "Beach villa in Bali, 5 nights, pool"</p>
      </div>`;
  },

  showStatus(message, type = 'info') {
    const status = document.getElementById('voice-status');
    const icons = { success: 'check', error: 'exclamation-triangle', info: 'info-circle', thinking: 'brain', recording: 'microphone', listening: 'ear' };
    const colors = { success: '#10b981', error: '#ef4444', info: '#06b6d4', thinking: '#a855f7', recording: '#f59e0b', listening: '#3b82f6' };

    status.innerHTML = `
      <div class="flex items-center gap-2 animate-fadeIn" style="color: ${colors[type]}">
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
      </div>`;
    
    if (type !== 'recording' && type !== 'listening') {
      setTimeout(() => status.innerHTML = '', 4000);
    }
  },

  // === 10. FILTERS (PRICE, TYPE, etc.) ===
  applyFilter(key, value) {
    this.filters[key] = value;
    this.search();
  }
};

// === GLOBAL FUNCTIONS ===
window.search = () => NEURAL_SEARCH.search();
window.toggleVoiceSearch = () => NEURAL_SEARCH.toggleVoiceSearch();
window.NEURAL_SEARCH = NEURAL_SEARCH;

// === INIT ON LOAD ===
document.addEventListener('DOMContentLoaded', () => {
  NEURAL_SEARCH.init();

  // Example: Auto-search on page load
  const urlParams = new URLSearchParams(location.search);
  if (urlParams.get('q')) {
    document.getElementById('ai-input').value = urlParams.get('q');
    NEURAL_SEARCH.search();
  }
});

// === CSS INJECTION FOR ANIMATIONS ===
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
`;
document.head.appendChild(style);