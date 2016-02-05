import getYahooWeather from 'yahoo-weather'
import localforage from 'localforage'

let user
let weather

localforage.on('Weather.user', data => {
  user = data
  return getWeather(true).then(data => {
    weather = data
  })
})

window.setInterval(
  getWeather.bind(undefined, true),
  Date.HOUR / 2
)

export default function getWeather (forceUpdate = false) {
  return Promise.all([getWeatherData(), getUserData()])
    .then(data => {
      const [weatherData, userData] = data
      const time = Date.now()
      const lastUpdate = weatherData ? time - weatherData.time : 0

      if (!userData) return Promise.reject('No user data')

      if (!forceUpdate && weatherData && lastUpdate < Date.HOUR / 2) {
        return weatherData
      }

      return getYahooWeather({ q: userData.location })
        .then(response => {
          const newData = {
            temp: response.item.condition.temp,
            forecast: response.item.forecast,
            time
          }

          localforage.set('Weather.data', newData, true)
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
