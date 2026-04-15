const CACHE_NAME = 'ecoPulse-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/risk.html',
  '/trends.html',
  '/alerts.html',
  '/map.html',
  '/css/style.css',
  '/js/api.js',
  '/js/risk-engine.js',
  '/js/features.js',
  '/js/charts.js',
  '/js/alerts.js'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetching strategy: Network first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
