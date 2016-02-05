import localforage from 'localforage'
import getGeolocation from './geolocation'

const config = {
  version: '1.1',
  data: [
    setConfig.bind('Panels', [
      {
        name: 'home',
        widgets: [
          'DateTimeWidget',
          'WeatherWidget',
          'SearchWidget',
          'WebsitesWidget'
        ]
      }
    ]),
    setConfig.bind('Search', {
      engine: {
        name: 'Google',
        href: 'https://www.google.com/search?q='
      }
    }),
    setConfig.bind('DateTime', {
      militaryTime: true,
      showSeconds: true
    }),
    setConfig.bind('Weather', {
      units: 'metric'
    }),
    setConfig.bind('Websites', {
      list: []
    })
  ]
}

function setConfig (config, forceReset) {
  return localforage.get(this).then(data =>
    !forceReset && data || localforage.set(this, config)
  )
}

export default function initConfig (forceReset) {
  return localforage.get('initialized').then(initialized => {
    if (!forceReset && initialized === config.version) {
      return true
    }

    getGeolocation().then(location =>
      localforage.set('Weather.user', { location }, true)
    )

    return Promise.all(
      config.data
        .map(fn => fn(forceReset))
        .concat(localforage.set('initialized', config.version))
    )
  })
}
