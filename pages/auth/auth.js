// pages/auth/ai/neural-auth.js — AI VOICE AUTH v9999.9
const NEURAL_AUTH = {
  socket: null,
  recognition: null,
  isListening: false,
  API_URL: 'https://syedcohost.onrender.com',

  // === 1. INIT SOCKET.IO ===
  initSocket() {
    this.socket = io(this.API_URL, { transports: ['websocket'] });
    this.socket.on('connect', () => console.log('AI: Connected to Neural Server'));
    this.socket.on('auth_response', (data) => this.handleAuthResponse(data));
    this.socket.on('error', (err) => alert('AI Error: ' + err.message));
  },

  // === 2. START VOICE LOGIN ===
  startVoiceLogin() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice not supported. Use manual login.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    const btn = document.getElementById('voice-login-btn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Listening...';
    btn.disabled = true;
    this.isListening = true;

    this.recognition.start();

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      console.log('Voice Input:', transcript);
      this.sendToAI('login', transcript);
    };

    this.recognition.onerror = (event) => {
      this.stopListening();
      alert('Voice Error: ' + event.error);
    };

    this.recognition.onend = () => this.stopListening();
  },

  // === 3. START VOICE REGISTER ===
  startVoiceRegister() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice not supported. Use manual form.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    const btn = document.getElementById('voice-register-btn');
    btn.innerHTML = '<i class="fas fa-microphone-slash"></i> Stop & Submit';
    btn.onclick = () => this.stopVoiceRegister();

    this.isListening = true;
    this.recognition.start();

    let fullTranscript = '';
    this.recognition.onresult = (event) => {
      fullTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      console.log('Register Voice:', fullTranscript);
    };

    this.recognition.onerror = (event) => {
      alert('Voice Error: ' + event.error);
      this.stopVoiceRegister();
    };
  },

  stopVoiceRegister() {
    if (!this.isListening) return;
    this.recognition.stop();
    this.isListening = false;

    const btn = document.getElementById('voice-register-btn');
    btn.innerHTML = '<i class="fas fa-microphone"></i> Register with Voice';
    btn.onclick = () => this.startVoiceRegister();

    const transcript = prompt('Confirm your voice input:', document.body.innerText.match(/Name|Email|Phone|Password/i)?.[0] || '');
    if (transcript) this.sendToAI('register', transcript);
  },

  // === 4. SEND TO AI SERVER ===
  sendToAI(action, voiceInput) {
    if (!this.socket?.connected) {
      alert('AI Server offline. Use manual form.');
      this.stopListening();
      return;
    }

    this.socket.emit('auth_request', {
      action,
      voice: voiceInput,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    this.showThinking();
  },

  // === 5. HANDLE AI RESPONSE ===
  handleAuthResponse(data) {
    this.hideThinking();

    if (data.success) {
      localStorage.setItem('token', data.token);
      alert(data.message || 'Welcome back!');
      window.location = '../host/property-owner-dashboard.html';
    } else if (data.form) {
      // AI parsed voice → fill form
      this.fillForm(data.form);
      alert('AI filled the form! Review & submit.');
    } else {
      alert(data.error || 'Authentication failed');
    }
  },

  // === 6. FILL FORM FROM AI ===
  fillForm(formData) {
    Object.keys(formData).forEach(key => {
      const input = document.querySelector(`[name="${key}"]`);
      if (input) input.value = formData[key];
    });
  },

  // === 7. UI: THINKING STATE ===
  showThinking() {
    const widget = document.getElementById('chat-widget');
    widget.innerHTML = `
      <div class="bg-gray-900 p-4 rounded-xl shadow-2xl text-cyan-400 animate-pulse">
        <i class="fas fa-brain"></i> AI is thinking...
      </div>`;
  },

  hideThinking() {
    document.getElementById('chat-widget').innerHTML = '';
  },

  // === 8. STOP LISTENING ===
  stopListening() {
    if (this.isListening && this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
    const btn = document.getElementById('voice-login-btn') || document.getElementById('voice-register-btn');
    if (btn) {
      btn.innerHTML = btn.id.includes('login') 
        ? '<i class="fas fa-microphone"></i> Voice Login'
        : '<i class="fas fa-microphone"></i> Register with Voice';
      btn.disabled = false;
      btn.onclick = btn.id.includes('login') ? startVoiceLogin : startVoiceRegister;
    }
  },

  // === 9. INIT ===
  init() {
    this.initSocket();
    console.log('NEURAL AUTH ENGINE v9999.9 — READY');
  }
};

// AUTO-START
document.addEventListener('DOMContentLoaded', () => NEURAL_AUTH.init());

// EXPORT FOR DEBUG
window.NEURAL_AUTH = NEURAL_AUTH;