if (!__dev__) {
  self.addEventListener('install', (event) => {
    // Perform install step:  loading each required file into cache
    return event.waitUntil(caches.open(__version__)
      // Add all offline dependencies to the cache
      .then((cache) => {
        return cache.addAll(['/codsworth/index.html'])
      })
      // At this point everything has been cached
      .then(() => {
        return self.skipWaiting()
      }))
  })

  self.addEventListener('fetch', (event) => {
    return event.respondWith(caches.match(event.request)
      // 1. Cache hit - return the response from the cached version
      // 2. Not in cache - return the result from the live server
      // `fetch` is essentially a "fallback"
      .then((res) => {
        return res || window.fetch(event.request)
      })
    )
  })

  self.addEventListener('activate', (event) => {
    // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
    event.waitUntil(self.clients.claim())

    return event.waitUntil(caches.keys().then((keyList) => {
      Promise.all(keyList.map((key) => {
        if ([__version__].indexOf(key) === -1) {
          return caches.delete(key)
        }
      }))
    }))
  })
}
