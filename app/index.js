require('./time')
require('./weather')
require('./bg-image')

if ('serviceWorker' in navigator) {
  // Listen for claiming of our ServiceWorker
  navigator.serviceWorker.addEventListener('controllerchange', function (event) {
    // Listen for changes in the state of our ServiceWorker
    navigator.serviceWorker.controller.addEventListener('statechange', function () {
      // If the ServiceWorker becomes "activated", let the user know they can go offline!
      if (this.state === 'activated') {
        console.log(this.state)
      }
    })
  })

  navigator.serviceWorker.register('offline-worker.js', {
    // scope: '.'
  }).then(registration => {
    // The service worker has been registered!
  })
}
