import getYahooWeather from 'yahoo-weather'
import localforage from 'localforage'

let user
let weather

localforage.on('Weather.user', data => {
  user = data
  console.log(`${Date.now()}: User updated`)
  getWeather(true).then(data => {
    weather = data
    console.log(`${Date.now()}: Weather updated`)
  })
})

export default function getWeather (update = false) {
  return Promise.all([getWeatherData(), getUserData()])
    .then(data => {
      const [weatherData, userData] = data
      const time = Date.now()
      const halfHour = 1000 * 60 * 30
      const lastUpdate = weatherData ? time - weatherData.time : 0

      if (!userData) return Promise.reject('No user data')

      if (!update && weatherData && lastUpdate < halfHour) {
        console.log(`${Date.now()}: Getting weather from cache`)
        return weatherData
      }

      return getYahooWeather({ q: userData.location })
        .then(response => {
          const newData = {
            temp: response.item.condition.temp,
            forecast: response.item.forecast,
            time
          }

          localforage.set('Weather.data', newData)
          localforage.emit('Weather.data', newData)
          console.log(`${Date.now()}: Getting weather from yahoo`)
          return newData
        })
    })
}

function getUserData () {
  if (user) return user
  return localforage.get('Weather.user')
}

function getWeatherData () {
  if (weather) return weather
  return localforage.get('Weather.data')
}
