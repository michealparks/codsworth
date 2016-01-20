import { loadGoogleAPI } from './google'

export default function getGeolocation () {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject('No geolocation.')

    Promise
      .all([getCurrentPosition(), loadGoogleAPI('maps', '3')])
      .then(data => {
        console.log(`${Date.now()}: Position obtained / maps loaded.`)
        const { latitude, longitude } = data[0].coords
        const geocoder = new window.google.maps.Geocoder()
        const location = new window.google.maps.LatLng(latitude, longitude)

        geocoder.geocode({ location }, (results, status) => {
          if (status !== window.google.maps.GeocoderStatus.OK) {
            return reject(status)
          }

          const components = results[0].address_components
          for (let i = 0, l = components.length; i < l; i++) {
            const types = components[i].types
            for (let ii = 0, ll = types.length; ii < ll; ii++) {
              if (types[ii] === 'administrative_area_level_1') {
                console.log(`${Date.now()}: City found.`)
                resolve(components[i].long_name)
              }
            }
          }
        })
      })
      .catch(err => window.alert(`We were unable to get your location.\nError Code: ${err}`))
  })
}

function getCurrentPosition () {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      data => resolve(data),
      err => reject(err)
    )
  )
}
