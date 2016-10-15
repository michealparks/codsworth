const icons = require('./icons')
const fetchWeather = require('./fetch-weather').fetchWeather.bind(null, onWeatherFetch)
const { get, set } = require('../util/storage')
const { minutes } = require('../util/time')
const container = document.getElementById('weather')
const temp = container.children[0]
const unit = container.children[1]
const icon = container.children[2]

let temperature
let userUnits = get('settings:weather-units') || 'C'

onWeatherFetch(get('weather'))
fetchWeather()

function onWeatherFetch (err, weather) {
  if (!weather) return
  if (err) return setTimeout(fetchWeather, minutes(2))

  temperature = weather.temp
  temp.textContent = convertUnits(temperature)
  unit.textContent = `\u00B0 ${userUnits}`
  icon.innerHTML = icons[weather.code.icon] || ''

  return setTimeout(fetchWeather, minutes(30))
}

function convertUnits (temp) {
  return userUnits === 'F' ? temp : ((temp - 32) * 5 / 9).toFixed(1)
}

container.onclick = () => {
  userUnits = (userUnits === 'F') ? 'C' : 'F'
  temp.textContent = convertUnits(temperature)
  unit.textContent = `\u00B0 ${userUnits}`

  set('settings:weather-units', userUnits)
}
