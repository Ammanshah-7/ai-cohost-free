// pages/guest/guest.js
const GUEST = {
  recognition: null,
  isListening: false,
  API_URL: 'https://syedcohost.onrender.com',

  toggleVoice() {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice not supported');
      return;
    }
    if (this.isListening) {
      this.recognition.stop();
      document.getElementById('voice-btn').innerHTML = '<i class="fas fa-microphone"></i>';
      this.isListening = false;
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.onresult = (e) => {
        document.getElementById('guest-search').value = e.results[0][0].transcript;
      };
      this.recognition.start();
      document.getElementById('voice-btn').innerHTML = '<i class="fas fa-stop"></i>';
      this.isListening = true;
    }
  },

  search() {
    const query = document.getElementById('guest-search').value;
    if (!query) return;

    fetch(`${this.API_URL}/api/guest-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })
    .then(r => r.json())
    .then(data => {
      const results = document.getElementById('results');
      results.innerHTML = data.properties.map(p => `
        <div class="quantum-card p-6 cursor-pointer" onclick="book('${p.id}')">
          <img src="${p.image}" class="w-full h-48 object-cover rounded-xl mb-4" />
          <h3 class="text-xl font-bold text-cyan-400">${p.title}</h3>
          <p class="text-gray-300">${p.location}</p>
          <p class="text-2xl font-bold text-white mt-2">$${p.price}/night</p>
        </div>
      `).join('');
    });
  }
};

function book(id) {
  localStorage.setItem('propertyId', id);
  window.location = '../payments/checkout.html';
}

window.toggleVoice = () => GUEST.toggleVoice();
window.search = () => GUEST.search();