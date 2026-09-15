'use strict';
var CACHE = 'chalupas-pos-pwa-v0.1.2-webclip-v3';
var APP_SHELL = ['./', './?v=3', './index.html', './styles.css', './core.js', './db.js', './app.js', './manifest.webmanifest?v=3', './apple-touch-icon-v3-152.png', './apple-touch-icon-v3-180.png', './icon-v3-192.png', './icon-v3-512.png'];
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(APP_SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(function (cached) {
    if (cached) return cached;
    return fetch(event.request).then(function (response) {
      if (!response || response.status !== 200 || response.type === 'opaque') return response;
      var copy = response.clone(); caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); }); return response;
    }).catch(function () {
      if (event.request.mode === 'navigate') return caches.match('./index.html');
      throw new Error('offline');
    });
  }));
});
