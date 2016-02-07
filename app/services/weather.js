import localforage from 'localforage'
import weatherCodes from './weather-codes'

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
      const lastUpdate = weatherData ? Date.now() - weatherData.time : 0

      if (!userData) {
        return Promise.reject('No user data')
      }

      if (!forceUpdate && weatherData && lastUpdate < Date.HOUR / 2) {
        return weatherData
      }

      return getYahooWeather({ q: userData.location })
    })
}

function getQueryUri (q) {
  return `https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where u='c' AND woeid in (select woeid from geo.places(1) where text="${q}")&format=json`
}

function getYahooWeather ({ q }) {
  return window.fetch(getQueryUri(q))
    .then(response => response.json())
    .then(response => {
      const { item, description } = response.query.results.channel

      console.log(description === 'Yahoo! Weather Error')
      if (description === 'Yahoo! Weather Error') {
        return Promise.reject(item.description)
      }

      const data = {
        temp: item.condition.temp,
        code: weatherCodes[item.condition.code],
        forecast: item.forecast.map(forecast => {
          forecast.code = weatherCodes[forecast.code]
          return forecast
        }),
        time: Date.now()
      }

      localforage.set('Weather.data', data, true)
      return data
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
