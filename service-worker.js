const CACHE_VERSION = 'nomadspeak-shell-v6';
const APP_SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './base.css',
  './components.css',
  './home-screen.css',
  './lesson-screen.css',
  './sentence-screen.css',
  './stats-screen.css',
  './board-screen.css',
  './utilities.css',
  './app.js',
  './script.js',
  './actions.js',
  './assets.js',
  './audio.js',
  './board-game.js',
  './board-screen.js',
  './chapter-cover-screen.js',
  './chapters.js',
  './constants.js',
  './debug-tools.js',
  './home-screen.js',
  './lesson-screen.js',
  './lesson.js',
  './modal.js',
  './qa-game.js',
  './render-board.js',
  './render-home.js',
  './render-lesson.js',
  './render-rewards.js',
  './render-shell.js',
  './screen-lifecycle.js',
  './sentence-game.js',
  './state.js',
  './stats-screen.js',
  './stats.js',
  './storage.js',
  './ui.js',
  './worlds.js',
  './data/sentences.json',
  './assets/characters/hero-main.png',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg',
  './assets/rewards/icons/reward-coin.png',
  './assets/rewards/icons/reward-diamond.png',
  './assets/rewards/icons/reward-flag.png',
  './assets/rewards/icons/reward-star.png',
  './assets/rewards/icons/reward-trophy.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const isNavigationRequest = event.request.mode === 'navigate';
  const requestDestination = event.request.destination;
  const isStaticAssetRequest = [
    'style',
    'script',
    'image',
    'font',
    'audio',
    'manifest',
  ].includes(requestDestination) || requestUrl.pathname.endsWith('.json');

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);

    if (isNavigationRequest) {
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok) {
          cache.put('./index.html', networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        const fallback = await cache.match('./index.html');
        if (fallback) return fallback;
        throw error;
      }
    }

    const cachedResponse = await cache.match(event.request, { ignoreSearch: true });
    if (cachedResponse) return cachedResponse;

    const networkResponse = await fetch(event.request);
    if (networkResponse.ok && isStaticAssetRequest) {
      cache.put(event.request, networkResponse.clone());
    }
    return networkResponse;
  })());
});
