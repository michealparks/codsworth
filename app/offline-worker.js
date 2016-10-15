/* global fetch, self, caches */

const { version } = require('../package.json')

self.addEventListener('install', event => {
  console.log('install')
  // Perform install step:  loading each required file into cache
  return event.waitUntil(caches.open(version)
    // Add all offline dependencies to the cache
    .then(cache => {
      console.log('cache', cache)
      return cache.addAll(['/index.html'])
    })
    // At this point everything has been cached
    .then(() => {
      console.log(self)
      return self.skipWaiting()
    }))
})

if (process.env.NODE_ENV === 'production') {
  self.addEventListener('fetch', (event) => {
    console.log('fetch', event)
    return event.respondWith(caches.match(event.request)
      // 1. Cache hit - return the response from the cached version
      // 2. Not in cache - return the result from the live server
      // `fetch` is essentially a "fallback"
      .then(res => {
        return res || fetch(event.request).then(response => {
          return caches.open(version).then(cache => {
            cache.put(event.request, response.clone())
            return response
          })
        })
      })
    )
  })
}

self.addEventListener('activate', event => {
  // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
  event.waitUntil(self.clients.claim())

  return event.waitUntil(caches.keys().then(keyList =>
    Promise.all(keyList.map(key => {
      if ([version].indexOf(key) === -1) {
        return caches.delete(key)
      }
    }))
  ))
})
