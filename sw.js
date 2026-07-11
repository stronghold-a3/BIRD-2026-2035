// ═══════════════════════════════════════════════════════════════════════
// BIRD 2026–2035 Validation Survey — Service Worker
// Strategy: app-shell cache-first for local files, stale-while-revalidate
// for CDN dependencies (Tailwind/Alpine/ECharts/Supabase-js), so the
// survey keeps working fully offline after the first successful visit.
// ═══════════════════════════════════════════════════════════════════════

const CACHE_VERSION = 'bird-survey-v1';
const APP_SHELL = [
    '.public/survey.html',
    '.public/dashboard.html',
    './manifest.webmanifest',
];

// Third-party assets we want cached so the survey renders even fully offline
// after the first load (CDN scripts referenced from survey.html <head>).
const CDN_ASSETS = [
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js',
    'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => {
            // Cache what we can; don't fail install if a CDN asset is momentarily unreachable
            return Promise.allSettled(
                [...APP_SHELL, ...CDN_ASSETS].map((url) =>
                    cache.add(new Request(url, { mode: url.startsWith('http') ? 'cors' : 'same-origin' })).catch(() => null)
                )
            );
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    const isCDN = CDN_ASSETS.some((a) => req.url.startsWith(a.split('?')[0].split('#')[0]) || req.url.includes(new URL(a).hostname));
    const isSameOrigin = url.origin === self.location.origin;

    if (isSameOrigin) {
        // App shell: cache-first, falling back to network, then updating cache
        event.respondWith(
            caches.match(req).then((cached) => {
                const fetchPromise = fetch(req)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.ok) {
                            const clone = networkResponse.clone();
                            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
                        }
                        return networkResponse;
                    })
                    .catch(() => cached);
                return cached || fetchPromise;
            })
        );
        return;
    }

    if (isCDN) {
        // Stale-while-revalidate for CDN libraries
        event.respondWith(
            caches.match(req).then((cached) => {
                const fetchPromise = fetch(req)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.ok) {
                            const clone = networkResponse.clone();
                            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
                        }
                        return networkResponse;
                    })
                    .catch(() => cached);
                return cached || fetchPromise;
            })
        );
        return;
    }

    // Everything else (e.g. Supabase API calls, remote images/videos): network-first,
    // fail silently offline — the app already degrades to localStorage for data.
    event.respondWith(
        fetch(req).catch(() => caches.match(req))
    );
});

// Allow the page to trigger an immediate cache refresh after deploying a new version
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
