import {weatherCode} from './codes-weather'
import {minutes} from '../util/time'
import {storage} from '../util/storage'

const baseURL = 'https://query.yahooapis.com/v1/public/yql?format=json&q='

let req, next
let didInit = false
let weather = storage('weather')
let location = storage('geolocation')

const init = () => {
  didInit = true
  return next ? fetchWeather(next) : null
}

const getGeolocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(onGetPosition, onGetPositionErr)
  }
}

const onGetPosition = ({ coords }) => {
  storage('geolocation', {
    time: Date.now(),
    latitude: coords.latitude,
    longitude: coords.longitude
  })
  location = coords

  return init()
}

const onGetPositionErr = (error) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
    case error.POSITION_UNAVAILABLE:
    case error.TIMEOUT:
    case error.UNKNOWN_ERROR: return
  }
}

export const fetchWeather = (callback) => {
  next = callback

  if (!didInit) return
  if (weather && (Date.now() - weather.time) < minutes(30)) {
    return next(null, weather)
  }

  req = new XMLHttpRequest()
  req.open('GET', typeof location === 'string'
    ? getCityQueryUrl(location)
    : getLatLngQueryUrl(location.latitude, location.longitude), true)
  req.responseType = 'json'
  req.onload = onWeatherFetch
  req.onerror = onWeatherError

  return req.send()
}

const getLatLngQueryUrl = (lat, lng) => {
  return baseURL + 'select * from weather.forecast where woeid in (SELECT woeid FROM geo.places(1) WHERE text="(' + lat + ',' + lng + ')")'
}

const getCityQueryUrl = (q) => {
  return baseURL + 'select * from weather.forecast where u="c" AND woeid in (select woeid from geo.places(1) WHERE text="' + q + '")'
}

const onWeatherFetch = () => {
  const channel = req.response.query.results.channel

  if (channel.description === 'Yahoo! Weather Error') {
    return next(channel.item.description)
  }

  weather = {
    temp: channel.item.condition.temp,
    code: weatherCode(channel.item.condition.code),
    time: Date.now()
  }

  storage('weather', weather)
  return next(null, weather)
}

const onWeatherError = () => {
  console.warn(req, req.response)
}

getGeolocation()

if (location) init()
