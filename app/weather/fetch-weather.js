/* global XMLHttpRequest */

const weatherCode = require('./codes-weather')
const { minutes } = require('../util/time')
const { get, set } = require('../util/storage')
const baseURL = 'https://query.yahooapis.com/v1/public/yql?format=json&q='

let req, next
let didInit = false
let weather = get('weather')
let location = get('geolocation')

getGeolocation()

if (location) init()

function init () {
  didInit = true
  return next ? fetchWeather(next) : null
}

function getGeolocation () {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(onGetPosition, onGetPositionErr)
  }
}

function onGetPosition ({ coords }) {
  set('geolocation', {
    time: Date.now(),
    latitude: coords.latitude,
    longitude: coords.longitude
  })
  location = coords

  return init()
}

function onGetPositionErr (error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
    case error.POSITION_UNAVAILABLE:
    case error.TIMEOUT:
    case error.UNKNOWN_ERROR:
      return
  }
}

function fetchWeather (callback) {
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

function getLatLngQueryUrl (lat, lng) {
  return `${baseURL}select * from weather.forecast where woeid in (SELECT woeid FROM geo.places(1) WHERE text="(${lat},${lng})")`
}

function getCityQueryUrl (q) {
  return `${baseURL}select * from weather.forecast where u='c' AND woeid in (select woeid from geo.places(1) WHERE text="${q}")`
}

function onWeatherFetch () {
  const { item, description } = req.response.query.results.channel

  if (description === 'Yahoo! Weather Error') {
    return next(item.description)
  }

  weather = {
    temp: item.condition.temp,
    code: weatherCode(item.condition.code),
    time: Date.now()
  }

  set('weather', weather)
  return next(null, weather)
}

function onWeatherError () {
  console.warn(req, req.response)
}

module.exports = { fetchWeather, getGeolocation }

