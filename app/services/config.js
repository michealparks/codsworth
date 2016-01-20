import localforage from 'localforage'
import getGeolocation from './geolocation'

export default function initConfig () {
  return new Promise((resolve, reject) => {
    localforage.get('Codsworth.initialized').then(initialized => {
      if (initialized) return resolve()

      getGeolocation().then(city => {
        localforage.emit('Weather.user', { location: city })
        localforage.set('Weather.user', { location: city })
      })

      return Promise.all([
        // Search
        localforage.set('Search.engine', {
          name: 'Google',
          href: 'https://www.google.com/search?q='
        }),

        // Weather
        localforage.set('Weather.units', 'metric'),

        // Websites
        localforage.set('Websites.list', []),

        // Initialized
        localforage.set('Codsworth.initialized', true)
      ]).then(resolve)
    })
  })
}
