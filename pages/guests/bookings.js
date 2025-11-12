// pages/guest/bookings.js — GUEST BOOKING MANAGEMENT v9999.9
const BOOKINGS = {
  socket: null,
  bookings: [],
  API_URL: 'https://syedcohost.onrender.com',

  init() {
    this.checkAuth();
    this.initSocket();
    this.loadBookings();
  },

  checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to view bookings');
      window.location = '../auth/login.html';
    }
  },

  initSocket() {
    this.socket = io(this.API_URL, { 
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') }
    });

    this.socket.on('connect', () => {
      this.showWidget('Connected to AI Booking System', 'success');
    });

    this.socket.on('booking_update', (booking) => {
      this.updateBooking(booking);
    });

    this.socket.on('booking_cancelled', (id) => {
      this.removeBooking(id);
    });
  },

  loadBookings() {
    fetch(`${this.API_URL}/api/my-bookings`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(r => r.json())
    .then(data => {
      this.bookings = data;
      this.renderBookings();
    })
    .catch(() => this.showWidget('Failed to load bookings', 'error'));
  },

  renderBookings() {
    const container = document.getElementById('bookings-list');
    const empty = document.getElementById('empty-state');

    if (!this.bookings.length) {
      container.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');
    container.innerHTML = this.bookings.map(b => `
      <div class="booking-card" data-id="${b.id}">
        <img src="${b.image || '../../static/images/default.jpg'}" alt="${b.property}" />
        <div class="booking-info">
          <h3>${b.property}</h3>
          <p><i class="fas fa-map-marker-alt"></i> ${b.location}</p>
          <p><i class="fas fa-calendar"></i> ${b.checkIn} → ${b.checkOut}</p>
          <p><i class="fas fa-users"></i> ${b.guests} guests</p>
          <div class="booking-meta">
            <span class="status-badge status-${b.status}">${b.status}</span>
            <span class="text-2xl font-bold text-white">$${b.total}</span>
          </div>
          <div class="booking-actions">
            ${b.status === 'confirmed' ? `
              <button class="btn-cancel" onclick="BOOKINGS.cancel('${b.id}')">
                <i class="fas fa-times"></i> Cancel
              </button>
            ` : ''}
            ${b.status === 'completed' ? `
              <button class="btn-review" onclick="BOOKINGS.review('${b.id}')">
                <i class="fas fa-star"></i> Review
              </button>
            ` : ''}
            <button class="btn-contact" onclick="BOOKINGS.contact('${b.hostId}')">
              <i class="fas fa-comment"></i> Contact Host
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  cancel(id) {
    if (!confirm('Cancel this booking?')) return;
    this.showWidget('Cancelling...', 'thinking');
    fetch(`${this.API_URL}/api/cancel-booking/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(() => this.showWidget('Cancelled', 'success'))
    .catch(() => this.showWidget('Cancel failed', 'error'));
  },

  review(id) {
    const rating = prompt('Rate 1-5:');
    const comment = prompt('Your review:');
    if (rating && comment) {
      fetch(`${this.API_URL}/api/review/${id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating, comment })
      });
    }
  },

  contact(hostId) {
    window.location = `messages.html?host=${hostId}`;
  },

  updateBooking(updated) {
    this.bookings = this.bookings.map(b => b.id === updated.id ? updated : b);
    this.renderBookings();
  },

  removeBooking(id) {
    this.bookings = this.bookings.filter(b => b.id !== id);
    this.renderBookings();
  },

  showWidget(msg, type) {
    const w = document.getElementById('chat-widget');
    const c = { success: '#10b981', thinking: '#a855f7', error: '#ef4444' };
    w.innerHTML = `<div class="p-3 rounded-lg text-white text-sm" style="background:${c[type]}">${msg}</div>`;
    setTimeout(() => w.innerHTML = '', 3000);
  }
};

// GLOBAL
window.BOOKINGS = BOOKINGS;
window.refreshBookings = () => BOOKINGS.loadBookings();

// INIT
document.addEventListener('DOMContentLoaded', () => BOOKINGS.init());