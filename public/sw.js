var CACHE_NAME = 'hansca-cache-v1';
var urlsToCache = [];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate',  event => {
  event.waitUntil(self.clients.claim());
});
