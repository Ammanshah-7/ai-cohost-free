// pages/auth/ai/neural-auth.js — NEURAL AUTH ENGINE v9999.9
const NEURAL_AUTH = {
  socket: null,
  recognition: null,
  isListening: false,
  API_URL: 'https://syedcohost.onrender.com',

  // === 1. INIT SOCKET.IO FOR REAL-TIME AI ===
  initSocket() {
    this.socket = io(this.API_URL, { 
      transports: ['websocket'], 
      reconnectionAttempts: 5 
    });

    this.socket.on('connect', () => {
      console.log('AI: Connected to Neural Server');
      this.showStatus('Connected', 'success');
    });

    this.socket.on('connect_error', (err) => {
      console.error('AI: Connection failed', err);
      this.showStatus('AI Offline', 'error');
    });

    this.socket.on('auth_response', (data) => this.handleAIResponse(data));
  },

  // === 2. START VOICE LOGIN ===
  startVoiceLogin() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice login not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    const btn = document.getElementById('voice-login-btn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Listening...';
    btn.classList.add('listening');
    btn.disabled = true;
    this.isListening = true;

    this.showStatus('Speak your credentials...', 'listening');

    this.recognition.start();

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      console.log('Voice Input:', transcript);
      this.sendToAI('login', transcript);
    };

    this.recognition.onerror = (event) => {
      this.stopListening();
      alert('Voice recognition error: ' + event.error);
      this.showStatus('Voice Error', 'error');
    };

    this.recognition.onend = () => this.stopListening();
  },

  // === 3. START VOICE REGISTER ===
  startVoiceRegister() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice registration not supported.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    const btn = document.getElementById('voice-register-btn');
    btn.innerHTML = '<i class="fas fa-stop"></i> Stop & Submit';
    btn.classList.add('recording');
    btn.onclick = () => this.stopVoiceRegister();

    this.isListening = true;
    this.showStatus('Speak: Name, Email, Phone, Password', 'recording');
    this.recognition.start();

    let fullTranscript = '';
    this.recognition.onresult = (event) => {
      fullTranscript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join(' ');
      document.getElementById('voice-preview')?.remove();
      const preview = document.createElement('p');
      preview.id = 'voice-preview';
      preview.textContent = 'You said: ' + fullTranscript;
      preview.className = 'text-sm text-cyan-300 mt-2 italic';
      btn.parentNode.appendChild(preview);
    };

    this.recognition.onerror = () => {
      this.stopVoiceRegister();
      this.showStatus('Voice Error', 'error');
    };
  },

  stopVoiceRegister() {
    if (!this.isListening) return;
    this.recognition.stop();
    this.isListening = false;

    const btn = document.getElementById('voice-register-btn');
    btn.innerHTML = '<i class="fas fa-microphone"></i> Register with Voice';
    btn.classList.remove('recording');
    btn.onclick = () => this.startVoiceRegister();

    const transcript = document.getElementById('voice-preview')?.textContent.replace('You said: ', '') || '';
    if (transcript) {
      this.sendToAI('register', transcript);
    } else {
      alert('No voice input detected.');
    }
  },

  // === 4. SEND VOICE TO AI SERVER ===
  sendToAI(action, voiceInput) {
    if (!this.socket?.connected) {
      alert('AI Server is offline. Please use manual form.');
      this.stopListening();
      return;
    }

    this.showStatus('AI is processing...', 'thinking');

    this.socket.emit('auth_request', {
      action,
      voice: voiceInput,
      page: location.pathname,
      timestamp: new Date().toISOString()
    });
  },

  // === 5. HANDLE AI RESPONSE ===
  handleAIResponse(data) {
    this.hideStatus();

    if (data.success) {
      localStorage.setItem('token', data.token);
      this.showStatus('Success! Redirecting...', 'success');
      setTimeout(() => {
        window.location = data.redirect || '../host/property-owner-dashboard.html';
      }, 1000);
    } 
    else if (data.form) {
      this.fillForm(data.form);
      this.showStatus('AI filled the form! Review & submit.', 'info');
    } 
    else if (data.error) {
      this.showStatus(data.error, 'error');
      alert('AI Error: ' + data.error);
    }
  },

  // === 6. FILL FORM FROM AI ===
  fillForm(formData) {
    Object.entries(formData).forEach(([key, value]) => {
      const input = document.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = value;
        input.style.borderColor = '#10b981';
        input.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.3)';
      }
    });
  },

  // === 7. UI STATUS WIDGET ===
  showStatus(message, type = 'info') {
    const widget = document.getElementById('chat-widget');
    const icons = {
      success: 'check-circle',
      error: 'exclamation-triangle',
      info: 'info-circle',
      listening: 'microphone',
      recording: 'circle',
      thinking: 'brain'
    };
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#06b6d4',
      listening: '#3b82f6',
      recording: '#f59e0b',
      thinking: '#a855f7'
    };

    widget.innerHTML = `
      <div class="p-3 rounded-lg shadow-xl text-white text-sm font-medium flex items-center gap-2 animate-fade"
           style="background: ${colors[type]}; animation: pulse 2s infinite;">
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
      </div>`;
  },

  hideStatus() {
    setTimeout(() => {
      document.getElementById('chat-widget').innerHTML = '';
    }, 3000);
  },

  // === 8. STOP LISTENING ===
  stopListening() {
    if (this.isListening && this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }

    ['voice-login-btn', 'voice-register-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('listening', 'recording');
        btn.innerHTML = id.includes('login') 
          ? '<i class="fas fa-microphone"></i> Voice Login'
          : '<i class="fas fa-microphone"></i> Register with Voice';
      }
    });
  },

  // === 9. INIT ===
  init() {
    this.initSocket();
    console.log('NEURAL AUTH ENGINE v9999.9 — ACTIVE');
  }
};

// AUTO-START
document.addEventListener('DOMContentLoaded', () => NEURAL_AUTH.init());

// GLOBAL ACCESS
window.startVoiceLogin = () => NEURAL_AUTH.startVoiceLogin();
window.startVoiceRegister = () => NEURAL_AUTH.startVoiceRegister();

// CSS ANIMATIONS
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.7); } 70% { box-shadow: 0 0 0 10px rgba(255,255,255,0); } 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); } }
  .animate-fade { animation: fadeIn 0.4s ease-out; }
`;
document.head.appendChild(style);