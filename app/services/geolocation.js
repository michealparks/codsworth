import { loadGoogleAPI } from './google'

export default function getGeolocation () {
  if (!navigator.geolocation) {
    Promise.reject('No geolocation.')
  }

  return Promise
    .all([getCurrentPosition(), loadGoogleAPI('maps', '3')])
    .then(data => {
      const { latitude, longitude } = data[0].coords

      return geocode(
        new window.google.maps.Geocoder(),
        new window.google.maps.LatLng(latitude, longitude)
      )
    })
    .catch(err =>
      window.alert(`We were unable to get your location.\nError Code: ${err}`)
    )
}

function getCurrentPosition () {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject)
  )
}

function geocode (geocoder, location) {
  return new Promise((resolve, reject) =>
    geocoder.geocode({ location }, (results, status) => {
      if (status !== window.google.maps.GeocoderStatus.OK) {
        return reject(status)
      }

      const components = results[0].address_components
      for (let i = 0, l = components.length; i < l; i++) {
        const types = components[i].types
        for (let ii = 0, ll = types.length; ii < ll; ii++) {
          if (types[ii] === 'administrative_area_level_1') {
            return resolve(components[i].long_name)
          }
        }
      }
    })
  )
}
