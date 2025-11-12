// pages/properties/ai/virtual-tour.js — v9999.9 | FULL 360° VR + GYRO + OCULUS
const VR_TOUR = {
  isActive: false,
  panorama: null,

  async start() {
    if (this.isActive) return;

    const modal = this.createModal();
    modal.innerHTML = this.getModalHTML();
    document.body.appendChild(modal);

    await this.initPanorama();
    this.bindControls();
    this.showWidget('VR Tour Active • Use mouse or gyro', 'success');
    this.isActive = true;
  },

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'vr-modal fixed inset-0 bg-black z-50 overflow-hidden';
    modal.innerHTML = '<div id="vr-close" class="absolute top-6 right-6 z-10 text-white text-3xl cursor-pointer">&times;</div>';
    return modal;
  },

  getModalHTML() {
    return `
      <div class="relative w-full h-full">
        <div id="panorama" class="w-full h-full"></div>
        
        <!-- MOBILE CONTROLS -->
        <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
          <button id="vr-gyro" class="vr-btn">
            <i class="fas fa-mobile-alt"></i> Gyro
          </button>
          <button id="vr-fullscreen" class="vr-btn">
            <i class="fas fa-expand"></i>
          </button>
        </div>

        <!-- INSTRUCTIONS -->
        <div class="absolute top-6 left-6 bg-black bg-opacity-70 text-white p-4 rounded-lg text-sm max-w-xs">
          <p class="font-bold mb-1"><i class="fas fa-vr-cardboard"></i> 360° VR Tour</p>
          <p>• Drag to look around</p>
          <p>• Mobile: Enable Gyro</p>
          <p>• Oculus: Auto-detected</p>
        </div>
      </div>`;
  },

  async initPanorama() {
    // Load Pannellum
    if (!window.pannellum) {
      await this.loadPannellum();
    }

    this.panorama = pannellum.viewer('panorama', {
      type: 'equirectangular',
      panorama: '../assets/360-villa.jpg',
      autoLoad: true,
      compass: true,
      northOffset: 0,
      showControls: false,
      hotSpots: [
        {
          pitch: -10,
          yaw: 180,
          type: 'info',
          text: 'Private Pool'
        },
        {
          pitch: 5,
          yaw: -90,
          type: 'info',
          text: 'Master Bedroom'
        }
      ]
    });

    // Auto-enter fullscreen on mobile
    if (this.isMobile()) {
      setTimeout(() => this.enterFullscreen(), 1000);
    }
  },

  async loadPannellum() {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.pannellum.org/2.5/pannellum.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdn.pannellum.org/2.5/pannellum.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  },

  bindControls() {
    document.getElementById('vr-close').onclick = () => this.exit();
    document.getElementById('vr-gyro').onclick = () => this.toggleGyro();
    document.getElementById('vr-fullscreen').onclick = () => this.toggleFullscreen();
  },

  toggleGyro() {
    if (!this.isMobile()) {
      this.showWidget('Gyro only works on mobile', 'error');
      return;
    }

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permission => {
          if (permission === 'granted') {
            this.enableGyro();
          }
        });
    } else {
      this.enableGyro();
    }
  },

  enableGyro() {
    window.addEventListener('deviceorientation', (e) => {
      if (!this.panorama) return;
      const yaw = e.alpha ? e.alpha : 0;
      const pitch = e.beta ? e.beta : 0;
      this.panorama.setYaw(yaw);
      this.panorama.setPitch(pitch - 90);
    });
    this.showWidget('Gyro Enabled', 'success');
  },

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  },

  enterFullscreen() {
    const elem = document.querySelector('.vr-modal');
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    this.showWidget('Fullscreen On', 'info');
  },

  exitFullscreen() {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  },

  exit() {
    document.querySelector('.vr-modal')?.remove();
    this.isActive = false;
    this.showWidget('VR Tour Ended', 'info');
  },

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  showWidget(msg, type = 'info') {
    const widget = document.getElementById('chat-widget');
    if (!widget) return;

    const colors = { success: '#10b981', error: '#ef4444', info: '#06b6d4' };
    widget.innerHTML = `
      <div class="p-3 rounded-lg text-white text-sm font-bold shadow-xl animate-bounce" 
           style="background: ${colors[type]}">
        <i class="fas fa-vr-cardboard"></i> ${msg}
      </div>`;
    setTimeout(() => widget.innerHTML = '', 3000);
  }
};

// GLOBAL
window.VR_TOUR = VR_TOUR;

// AUTO-START IF URL PARAM
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.search.includes('vr=1')) {
    setTimeout(() => VR_TOUR.start(), 1000);
  }
});