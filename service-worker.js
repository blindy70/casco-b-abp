var CACHE = 'casco-abp-v8';
var SHELL = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'config.js',
  'manifest.json',
  'Escudo.png',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) {
    if (url.hostname.indexOf('google.com') !== -1 && url.pathname.indexOf('/macros/') !== -1) {
      if (url.searchParams.get('action') === 'video') {
        e.respondWith(fetch(e.request));
      } else {
        e.respondWith(networkFirst(e.request));
      }
    }
    return;
  }
  e.respondWith(networkFirst(e.request));
});

function networkFirst(req) {
  return fetch(req)
    .then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    })
    .catch(function () { return caches.match(req); });
}