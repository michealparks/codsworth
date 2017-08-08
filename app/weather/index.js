const fetchWeather = require('./fetch-weather').fetchWeather.bind(undefined, onWeatherFetch)
const storage = require('../util/storage')
const {minutes} = require('../util/time')
const container = document.getElementById('weather')
const temp = container.children[0]
const unit = container.children[1]
const icon = container.children[2]

let temperature
let userUnits = storage('settings:weather-units') || 'C'

onWeatherFetch(storage('weather'))
fetchWeather()

function makeIcon (code) {
  return `<svg><use xlink:href='#icon-${code}'></use></svg>`
}

function onWeatherFetch (err, weather) {
  if (!weather) return

  if (err) return setTimeout(fetchWeather, minutes(2))

  temperature = weather.temp
  temp.textContent = convertUnits(temperature)
  unit.textContent = `\u00B0 ${userUnits}`
  icon.innerHTML = makeIcon(weather.code.icon || '')

  return setTimeout(fetchWeather, minutes(30))
}

function convertUnits (n) {
  return userUnits === 'F' ? n : ((n - 32) * 5 / 9).toFixed(1)
}

container.onclick = () => {
  userUnits = (userUnits === 'F') ? 'C' : 'F'
  temp.textContent = convertUnits(temperature)
  unit.textContent = `\u00B0 ${userUnits}`

  storage('settings:weather-units', userUnits)
}
