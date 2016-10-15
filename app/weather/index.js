const icons = require('./icons')
const fetchWeather = require('./fetch-weather').bind(null, onWeatherFetch)
const { minutes } = require('../util/time')
const container = document.getElementById('weather')
const temp = container.children[0]
const unit = container.children[1]
const icon = container.children[2]

fetchWeather()

function onWeatherFetch (err, weather) {
  if (err) return setTimeout(fetchWeather, minutes(2))

  console.log(weather.code.icon, weather)
  temp.textContent = weather.temp
  unit.textContent = '\u00B0 F'
  icon.innerHTML = icons[weather.code.icon] || ''

  return setTimeout(fetchWeather, minutes(30))
}
