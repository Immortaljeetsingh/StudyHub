const CACHE_NAME = 'studyhub-v9';
const STATIC_ASSETS = [
  './',
  './study-hub.html',
  './styles.css',
  './enhancements.css',
  './app.js',
  './quiz-engine.js',
  './api-utils.js',
  './flashcards-app.js',
  './pomodoro.js',
  './bookmark-notes.js',
  './inject-unit-nav.js',
  './manifest.json',
  './pwa-register.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './index.html',
  './flashcards.html',
  './sample-papers.html',
  './quiz-results.html'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for static, network-first for HTML pages
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (Firebase, Google Fonts, etc.)
  if (url.origin !== self.location.origin) return;

  // For page navigations: network-first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match('./study-hub.html', { ignoreSearch: true })
            .then(r => r || caches.match('./index.html', { ignoreSearch: true }))
        )
    );
    return;
  }

  // For CSS/JS: cache-first (ignoreSearch stops unbounded ?v= entries)
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
