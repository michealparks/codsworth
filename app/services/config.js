import localforage from 'localforage'
import getGeolocation from './geolocation'
import { emit } from './mediator'

export default function initConfig () {
  return new Promise((resolve, reject) => {
    localforage.get('Codsworth.initialized').then(initialized => {
      if (initialized) return resolve()

      getGeolocation().then(city =>
        emit('Weather.user.update', { location: city })
      )

      return Promise.all([
        // Search
        localforage.set('Search.engine', {
          name: 'Google',
          href: 'https://www.google.com/search?q='
        }),

        // Weather
        localforage.set('Weather.units', 'metric'),
        localforage.set('Weather.user', {
          location: 'West Palm Beach'
        }),

        // Websites
        localforage.set('Websites.list', []),

        // Initialized
        localforage.set('Codsworth.initialized', true)
      ]).then(resolve)
    })
  })
}
