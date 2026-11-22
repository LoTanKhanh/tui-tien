/* Túi Tiền: lưu bản app trong máy để mở được khi không có mạng */
var CACHE = 'tui-tien-v2';

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(['./', './index.html'].map(function (u) {
        return c.add(u).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Mở từ bộ nhớ trước cho nhanh, đồng thời cập nhật bản mới ở phía sau */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  /* Chỉ lưu file của app; các yêu cầu sang nơi khác (Google Sheet) đi thẳng ra mạng */
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      var net = fetch(e.request).then(function (r) {
        if (r && r.ok) {
          var copy = r.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return r;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
