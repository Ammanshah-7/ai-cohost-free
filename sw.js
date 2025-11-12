// sw.js (root)
const CACHE = 'syedcohost-v9999.9';
const OFFLINE = '/pages/offline.html';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll([
    '/', '/pages/intro/', '/core/css/airbnb.css', OFFLINE
  ])));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request)
      .catch(() => caches.match(OFFLINE)))
  );
});