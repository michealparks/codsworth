import localforage from 'localforage'
import getGeolocation from './geolocation'

const config = {
  version: '2.0.0',
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

/*
 * Checks if a config is absent in storage and inserts a
 * default if so. Will also insert a config if forced.
 */
function setConfig (config, forceReset) {
  return localforage.get(this).then(data =>
    (!forceReset && data) || localforage.set(this, config)
  )
}

/*
 *
 */
export default function initConfig (forceReset) {
  return localforage.get('initialized').then(initialized => {
    if (!forceReset && config.version === initialized) {
      return false
    }

    const configVersion = config.version.split('.')[0]
    const curVersion = initialized && initialized.split('.')[0]
    if (configVersion === curVersion) {
      forceReset = true
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
