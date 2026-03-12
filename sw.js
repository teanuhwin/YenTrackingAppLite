// sw.js — Yen Tracker Service Worker
// Bump this version string any time you update the app,
// so the old cache gets replaced automatically.
const CACHE_NAME = 'yen-tracker-v1';

// Everything the app needs to run with zero network access.
// External CDN assets (Tailwind, Google Fonts) are also cached
// on first load so they survive offline.
const PRECACHE_URLS = [
    './',               // the HTML page itself (index route)
    './index.html',     // explicit HTML filename fallback
];

// ── Install: cache the shell immediately ─────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
    );
    // Activate right away instead of waiting for old tabs to close
    self.skipWaiting();
});

// ── Activate: delete any old caches from previous versions ───────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

// ── Fetch: network-first for exchange-rate APIs, cache-first for everything else
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // For exchange rate API calls — try network, don't cache (data changes),
    // and if offline just let the app handle the failure gracefully.
    const isRateAPI = [
        'frankfurter.app',
        'open.er-api.com',
        'exchangerate.host',
    ].some(host => url.hostname.includes(host));

    if (isRateAPI) {
        // Pass straight through — no caching, app already has offline fallback
        event.respondWith(fetch(event.request));
        return;
    }

    // For everything else (the app shell + CDN assets):
    // Try cache first, fall back to network and store the result.
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;

            return fetch(event.request).then(response => {
                // Only cache valid responses
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }
                const toCache = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
                return response;
            }).catch(() => {
                // Network failed and nothing in cache — nothing we can do
                return new Response('Offline and not cached.', { status: 503 });
            });
        })
    );
});
