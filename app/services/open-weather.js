import { ls } from './storage'

const API_KEY = '3306be16c0e6fe58e677c17c97488f95'
const API_VERSION = '2.5'
const API_BASE_URL = `http://api.openweathermap.org/data`
const SEARCH_ENDPOINT = `${API_BASE_URL}/${API_VERSION}/find`
const CURRENT_ENDPOINT = `${API_BASE_URL}/${API_VERSION}/weather`
const FORECAST_ENDPOINT = `${API_BASE_URL}/${API_VERSION}/forecast/daily`

const BASE_PARAMS = [
  `&APPID=${API_KEY}`,
  'lang=en',
  'mode=JSON',
  'units=imperial'
].join('&')

export function searchLocations (location) {
  return new Promise((resolve, reject) => {
    const SEARCH_PARAMS = [
      `q=${window.encodeURIComponent(location)}`,
      'type=like'
    ].join('&').concat(BASE_PARAMS)

    const url = `${SEARCH_ENDPOINT}?${SEARCH_PARAMS}`

    return window.fetch(url, { credentials: 'same-origin' })
      .then(response => response.json())
      .then(response => resolve(response.list))
      .catch(err => reject(err))
  })
}

export function getCurrentWeather (config) {
  const {latitude, longitude} = config

  return new Promise((resolve, reject) => {
    const CURRENT_PARAMS = [
      `lat=${latitude}`,
      `lon=${longitude}`
    ].join('&').concat(BASE_PARAMS)

    const url = `${CURRENT_ENDPOINT}?${CURRENT_PARAMS}`
    return window.fetch(url, { credentials: 'same-origin' })
      .then(response => response.json())
      .then(response => resolve({
        tempCurrent: Math.round(response.main.temp),
        tempMin: Math.round(response.main.temp_min),
        tempMax: Math.round(response.main.temp_max)
      }))
      .catch(err => reject(err))
  })
}

export function getWeatherForecast (config) {
  const {latitude, longitude} = config

  return new Promise((resolve, reject) => {
    const FORECAST_PARAMS = [
      `lat=${latitude}`,
      `lon=${longitude}`
    ].join('&').concat(BASE_PARAMS)

    const url = `${FORECAST_ENDPOINT}?${FORECAST_PARAMS}`

    return window.fetch(url, { credentials: 'same-origin' })
      .then(response => response.json())
      .then(response =>
        resolve(response.list.map(forecast => ({
          day: new Date(forecast.dt * 1000).toString().split(' ')[0],
          icon: forecast.weather[0].icon,
          tempMax: Math.round(forecast.temp.max),
          tempMin: Math.round(forecast.temp.min)
        })))
      )
      .catch(err => reject(err))
  })
}

const INTERVAL = (1).hour()
updateWeather()
// window.setInterval(updateWeather, INTERVAL)

function updateWeather () {
  // const t = ls.get('Codsworth.Widgets.Weather.collectionTime')
  const latitude = ls.get('Codsworth.Widgets.Weather.location.latitude')
  const longitude = ls.get('Codsworth.Widgets.Weather.location.longitude')

  // if (t && Date.now() - t < INTERVAL) return
  // if (!t) ls.set('Codsworth.Widgets.Weather.collectionTime', Date.now())

  getCurrentWeather({ latitude, longitude })
    .then(response => {
      ls.set('Codsworth.Widgets.Weather.current.temp', response.tempCurrent)
      ls.set('Codsworth.Widgets.Weather.current.min', response.tempMin)
      ls.set('Codsworth.Widgets.Weather.current.max', response.tempMax)
    })
    .catch(err => { throw err })

  getWeatherForecast({ latitude, longitude })
    .then(response => {
      console.log(response)
      ls.setJSON('Codsworth.Widgets.Weather.forecast', response)
    })
}

