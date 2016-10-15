require('./weather')
require('./bg-image')
require('./time')

if ('serviceWorker' in navigator) {
  // Listen for claiming of our ServiceWorker
  navigator.serviceWorker.addEventListener('controllerchange', event =>
    // Listen for changes in the state of our ServiceWorker
    navigator.serviceWorker.controller.addEventListener('statechange', function () {
      console.log(this.state)
    })
  )

  navigator.serviceWorker.register('offline-worker.js')
    .then(registration => {
      // The service worker has been registered!
    })
    .catch(err => {
      console.error(err)
    })
}
