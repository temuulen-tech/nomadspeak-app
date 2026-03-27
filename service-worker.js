const CACHE_VERSION = 'nomadspeak-shell-v7';
const SHELL_CACHE = CACHE_VERSION;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

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
  './assets/icons/nomadspeak-app-icon-192.svg',
  './assets/icons/nomadspeak-app-icon-512.svg',
  './assets/icons/nomadspeak-app-icon-512-maskable.svg',
  './assets/rewards/icons/reward-coin.png',
  './assets/rewards/icons/reward-diamond.png',
  './assets/rewards/icons/reward-flag.png',
  './assets/rewards/icons/reward-star.png',
  './assets/rewards/icons/reward-trophy.png',
];

const DESTINATIONS_TO_CACHE = new Set([
  'style',
  'script',
  'image',
  'font',
  'audio',
  'manifest',
]);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.allSettled(
      APP_SHELL_ASSETS.map(async (asset) => {
        try {
          await cache.add(asset);
        } catch (_) {
          // Keep install resilient if one asset is temporarily unavailable.
        }
      })
    );
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

async function networkFirst(request, { cacheName, fallbackUrl } = {}) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      if (fallbackUrl && request.mode === 'navigate') {
        await cache.put(fallbackUrl, response.clone());
      }
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request, { ignoreSearch: true });
    if (cachedResponse) return cachedResponse;
    if (fallbackUrl) {
      const fallbackResponse = await cache.match(fallbackUrl, { ignoreSearch: true });
      if (fallbackResponse) return fallbackResponse;
    }
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const isNavigationRequest = event.request.mode === 'navigate';
  const isStaticAssetRequest = DESTINATIONS_TO_CACHE.has(event.request.destination)
    || requestUrl.pathname.endsWith('.json');

  if (isNavigationRequest) {
    event.respondWith(networkFirst(event.request, {
      cacheName: SHELL_CACHE,
      fallbackUrl: './index.html',
    }));
    return;
  }

  if (isStaticAssetRequest) {
    event.respondWith(networkFirst(event.request, {
      cacheName: RUNTIME_CACHE,
    }));
  }
});
