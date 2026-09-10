'use strict';

// גרסה — כל שינוי בנכסים מחייב העלאת המספר. שם ה-cache נגזר ממנה, כך
// שגרסה חדשה = cache חדש נקי, וה-activate מוחק את הישנים. זה פותר גם את
// בעיית ה-CSS הישן (שבגללה הוסר ה-cache לגמרי ב-v4) וגם מחזיר תמיכה offline.
const VERSION = 'sudoku-v5';

const SHELL = [
  './',
  './index.html',
  './style.css?v=2',
  './script.js',
  './manifest.json',
  './favicon.svg',
  './icon-192.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// same-origin GET: stale-while-revalidate — מגישים מיד מה-cache, ומרעננים ברקע.
// שאר הבקשות (גופנים מ-Google): רשת, ובכשל — cache אם יש.
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res && res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  e.respondWith(fetch(request).catch(() => caches.match(request)));
});
