import './weather'
import './bg-image'
import './time'

if (navigator.serviceWorker !== undefined) {
  // Listen for claiming of our ServiceWorker
  navigator.serviceWorker.addEventListener('controllerchange', (event) =>
    // Listen for changes in the state of our ServiceWorker
    navigator.serviceWorker.controller.addEventListener('statechange', () => {
      // nothing
    })
  )

  navigator.serviceWorker.register('offline-worker.js')
    .then((registration) => {
      // The service worker has been registered!
    })
    .catch((err) => console.error(err))
}
