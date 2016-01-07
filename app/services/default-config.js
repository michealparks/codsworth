import { ls } from './storage'

const initialized = ls.get('Codsworth.initialized')

if (!initialized) init()

function init () {
  // Widget.Search
  ls.set('Codsworth.Widgets.Search.engine.name', 'Google')
  ls.set('Codsworth.Widgets.Search.engine.href', 'https://www.google.com/search?q=')

  // Widget.Weather
  ls.set('Codsworth.Widgets.Weather.location.latitude', '40.78')
  ls.set('Codsworth.Widgets.Weather.location.longitude', '-73.95')
  ls.set('Codsworth.Widgets.Weather.units', 'imperial')
}
