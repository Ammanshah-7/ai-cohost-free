// pages/offline/offline.js
document.getElementById('retry-btn').addEventListener('click', () => {
  if (navigator.onconnection?.effectiveType) {
    location.reload();
  } else {
    window.location.href = '../index.html';
  }
});

// Auto-retry if back online
window.addEventListener('online', () => {
  setTimeout(() => location.reload(), 2000);
});