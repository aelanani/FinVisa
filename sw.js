// ══════════════════════════════════════════════════════
//  sw.js — Service Worker لـ شيت استثمار
//  الإصدار: 1.0.0
// ══════════════════════════════════════════════════════

const CACHE_NAME = 'invest-sheet-v14';
const OFFLINE_URL = 'index.html';

// الملفات التي يتم تخزينها فور التثبيت (App Shell)
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ── حدث التثبيت: تخزين الـ App Shell ──
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        // لو الأيقونات ماعندهاش، متفشلش التثبيت
        console.warn('[SW] Precache partial failure (icons?):', err);
        return cache.add('./index.html');
      });
    }).then(() => {
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

  // ━━ HTML (index.html) → Network First, Fallback to Cache ━━
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(OFFLINE_URL).then((cached) => {
            if (cached) return cached;
            return new Response(
              `<!DOCTYPE html><html lang="ar" dir="rtl">
              <head><meta charset="UTF-8"><title>غير متصل</title>
              <style>body{font-family:sans-serif;text-align:center;padding:40px;background:#f8f8f8}
              h1{font-size:2rem;color:#2563eb} p{color:#666;margin-top:12px}</style></head>
              <body><h1>📴</h1><h1>أنت غير متصل</h1>
              <p>تحقق من الاتصال بالإنترنت وأعد المحاولة</p>
              <button onclick="location.reload()" style="margin-top:20px;padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer">إعادة المحاولة</button>
              </body></html>`,
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
          });
        })
    );
    return;
  }

  // ━━ باقي الطلبات (JS/CSS/Images) → Stale While Revalidate ━━
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response.ok && request.method === 'GET') {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => null);

        return cached || networkFetch;
      })
    )
  );
});

// ── Push Notifications (مستقبلاً) ──
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'شيت استثمار', {
    body: data.body || '',
    icon: './icon-192.png',
    badge: './icon-192.png',
    dir: 'rtl',
    lang: 'ar'
  });
});
