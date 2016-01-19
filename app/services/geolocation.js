export default function getGeolocation () {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject('No geolocation.')

    navigator.geolocation.getCurrentPosition(data => {
      const { latitude, longitude } = data.coords
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
              resolve(components[i].long_name)
            }
          }
        }
      })
    }, err => reject(err))
  })
}
