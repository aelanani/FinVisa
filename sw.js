// ══════════════════════════════════════════════════════
//  sw.js — Service Worker لـ Vault
//  الإصدار: 1.0.0
// ══════════════════════════════════════════════════════

// اسم الكاش جديد (Vault) عشان الهوية الجديدة (الاسم + اللوجو + الأيقونات + الثيم الرمادي) تتحمّل فريش،
// وبيتمسح الكاش القديم تلقائيًا في حدث activate
const CACHE_NAME = 'vault-d9dc81';
const OFFLINE_URL = 'index.html';

// الملفات التي يتم تخزينها فور التثبيت (App Shell)
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './logo.svg',
  './favicon.svg',
  // BEGIN-JS-PRECACHE
  './js/app-main.js?v=2c80f900',
  './js/certs-debts-extras.js?v=07371e21',
  './js/early-boot.js?v=a555ec8f',
  './js/i18n-extra.js?v=ff7a2fcd',
  './js/i18n-full.js?v=4b7aa0c1',
  './js/quick-add.js?v=c5884d54',
  './js/sync-status.js?v=cd98008a',
  './js/tabs-enhance.js?v=a5094891',
  './js/theme-ui.js?v=051f32d4',
  './js/ux-layer.js?v=167040a3'
  // END-JS-PRECACHE
];

// ── حدث التثبيت: تخزين الـ App Shell ──
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // كل ملف لوحده: لو ملف فشل (أيقونة مثلًا) باقي الملفات تتخزّن عادي
      Promise.all(PRECACHE_ASSETS.map((u) => cache.add(u).catch((err) => console.warn('[SW] precache miss:', u, err))))
    ).then(() => {
      console.log('[SW] Installed ✅');
      return self.skipWaiting();
    })
  );
});

// ── حدث التفعيل: حذف الـ cache القديم ──
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activated ✅');
      return self.clients.claim();
    })
  );
});

// ── Network First مع مهلة: لو النت بطيء (> 2.5 ثانية) نفتح فورًا من الكاش، والتحميل يكمّل في الخلفية ويحدّث الكاش ──
const NETWORK_TIMEOUT_MS = 2500;
function networkFirstWithTimeout(request, event) {
  const fromCache = () => caches.match(request, { ignoreSearch: true }).then((c) => c || caches.match(OFFLINE_URL));
  const net = fetch(request, { cache: 'no-store' }).then((response) => {
    if (response.ok) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
    }
    return response;
  });
  // نكمّل التحميل في الخلفية حتى لو رجّعنا الكاش
  event.waitUntil(net.catch(() => {}));
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS));
  return Promise.race([net.catch(() => null), timeout]).then((res) => res || fromCache().then((c) => c || net));
}

// ── حدث الفتش: استراتيجية هجينة ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ━━ Firebase / Google APIs → دايماً شبكة (real-time) ━━
  if (
    url.hostname.includes('firebasedatabase.app') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('google-analytics.com')
  ) {
    return; // اترك المتصفح يتعامل معاه
  }

  // ━━ Google Fonts → Cache First ━━
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // ━━ style.css → Network First بمهلة قصيرة ━━
  if (url.pathname.endsWith('style.css')) {
    event.respondWith(networkFirstWithTimeout(request, event));
    return;
  }

  // ━━ ملفات js/ (نسخها بالـ ?v=hash يعني ثابتة) → Cache First ━━
  if (url.origin === self.location.origin && url.pathname.includes('/js/') && url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => cached || fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        }))
      )
    );
    return;
  }

  // ━━ HTML (index.html) → Network First بمهلة، وبعدها الكاش ━━
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirstWithTimeout(request, event));
    return;
  }

  // ━━ باقي الطلبات (JS/CSS/Images) → Stale While Revalidate ━━
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request, { cache: 'no-store' }).then((response) => {
          if (response.ok && request.method === 'GET') {
            cache.put(request, response.clone());
            _bgtTrimCache(cache); // منع نمو الكاش بلا حدود مع الوقت
          }
          return response;
        }).catch(() => null);

        return cached || networkFetch;
      })
    )
  );
});

// ── حماية بسيطة من تضخّم الكاش: حد أقصى لعدد العناصر المخزّنة ديناميكيًا ──
const MAX_DYNAMIC_CACHE_ENTRIES = 80;
async function _bgtTrimCache(cache) {
  try {
    const keys = await cache.keys();
    if (keys.length > MAX_DYNAMIC_CACHE_ENTRIES) {
      // بنمسح الأقدم (أول عناصر في القائمة) لحد ما نرجع تحت الحد
      const protectedUrls = new Set(PRECACHE_ASSETS.map((u) => new URL(u, self.location).href));
      const deletable = keys.filter((k) => !protectedUrls.has(k.url));
      const toDelete = Math.min(keys.length - MAX_DYNAMIC_CACHE_ENTRIES, deletable.length);
      for (let i = 0; i < toDelete; i++) {
        await cache.delete(deletable[i]);
      }
    }
  } catch (e) {
    console.warn('[SW] Cache trim failed:', e);
  }
}


// ── Push Notifications (مستقبلاً) ──
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'Vault', {
    body: data.body || '',
    icon: './icon-192.png',
    badge: './icon-192.png',
    dir: 'rtl',
    lang: 'ar'
  });
});
