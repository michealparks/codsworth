import localforage from 'localforage'
import getGeolocation from './geolocation'

const config = {
  'version': '1.0',
  'Widgets.active': forceReset => localforage.get('Widgets.active')
    .then(data => !forceReset && data || localforage.set('Widgets.active', [
      'DateTimeWidget',
      'WeatherWidget',
      'SearchWidget',
      'WebsitesWidget'
    ])
  ),
  'Search.engine': forceReset => localforage.get('Widgets.active')
    .then(data => !forceReset && data || localforage.set('Search.engine', {
      name: 'Google',
      href: 'https://www.google.com/search?q='
    })
  )
}

export default function initConfig (forceReset) {
  return new Promise((resolve, reject) => {
    localforage.get('Codsworth.initialized').then(initialized => {
      if (!forceReset && initialized === config.version) return resolve()

      getGeolocation().then(city => {
        localforage.emit('Weather.user', { location: city })
        localforage.set('Weather.user', { location: city })
      })

      return Promise.all([
        config['Widgets.active'](forceReset),
        config['Search.engine'](forceReset),

        // Weather
        localforage.set('Weather.units', 'metric'),

        // Websites
        localforage.set('Websites.list', []),

        // Initialized
        localforage.set('Codsworth.initialized', config.version)
      ]).then(resolve)
    })
  })
}
