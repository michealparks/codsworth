import getYahooWeather from 'yahoo-weather'
import localforage from 'localforage'
import { HOUR } from './time'

window.getYahooWeather = getYahooWeather

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

window.setInterval(() => {
  console.log(`${Date.now()}: Auto-updating weather`)
  getWeather.bind(undefined, true)
}, HOUR / 2)

export default function getWeather (forceUpdate = false) {
  return Promise.all([getWeatherData(), getUserData()])
    .then(data => {
      const [weatherData, userData] = data
      const time = Date.now()
      const lastUpdate = weatherData ? time - weatherData.time : 0

      if (!userData) return Promise.reject('No user data')

      if (!forceUpdate && weatherData && lastUpdate < HOUR / 2) {
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
