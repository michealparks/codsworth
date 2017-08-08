/* global fetch, self, caches */

if (process.env.NODE_ENV === 'production') {
  self.addEventListener('install', function (event) {
    // Perform install step:  loading each required file into cache
    return event.waitUntil(caches.open(__version__)
      // Add all offline dependencies to the cache
      .then(function cache () {
        return cache.addAll(['/codsworth/index.html'])
      })
      // At this point everything has been cached
      .then(function () {
        return self.skipWaiting()
      }))
  })

  self.addEventListener('fetch', function (event) {
    return event.respondWith(caches.match(event.request)
      // 1. Cache hit - return the response from the cached version
      // 2. Not in cache - return the result from the live server
      // `fetch` is essentially a "fallback"
      .then(function (res) {
        return res || fetch(event.request)
      })
    )
  })

  self.addEventListener('activate', function (event) {
    // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
    event.waitUntil(self.clients.claim())

    return event.waitUntil(caches.keys().then(function (keyList) {
      Promise.all(keyList.map(function (key) {
        if ([__version__].indexOf(key) === -1) {
          return caches.delete(key)
        }
      }))
    }))
  })
}
