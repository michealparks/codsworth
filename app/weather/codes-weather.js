let arr = [
  'Tornado',
  'Tropical storm',
  'Hurricane',
  'Severe thunderstorms',
  'Thunderstorms',
  'Mixed rain and snow',
  'Mixed rain and sleet',
  'Mixed snow and sleet',
  'Freezing drizzle',
  'Drizzle',
  'Freezing rain',
  'Showers',
  'Showers',
  'Snow flurries',
  'Light snow showers',
  'Blowing snow',
  'Snow',
  'Hail',
  'Sleet',
  'Dust',
  'Foggy',
  'Haze',
  'Smoky',
  'Blustery',
  'Windy',
  'Cold',
  'Cloudy',
  'Mostly cloudy (night)',
  'Mostly cloudy (day)',
  'Partly cloudy (night)',
  'Partly cloudy (day)',
  'Clear (night)',
  'Sunny',
  'Fair (night)',
  'Fair (day)',
  'Mixed rain and hail',
  'Hot',
  'Isolated thunderstorms',
  'Scattered thunderstorms',
  'Scattered thunderstorms',
  'Scattered showers',
  'Heavy snow',
  'Scattered snow showers',
  'Heavy snow',
  'Partly cloudy',
  'Thundershowers',
  'Snow showers',
  'Isolated thundershowers'
]

function icon (description) {
  switch (description) {
    case 'Tornado':
    case 'Tropical storm':
    case 'Hurricane':
    case 'Severe thunderstorms':
    case 'Thunderstorms':
    case 'Isolated thunderstorms':
    case 'Scattered thunderstorms':
    case 'Thundershowers':
    case 'Isolated thundershowers':
      return 'stormy'

    case 'Mixed rain and snow':
    case 'Mixed rain and sleet':
    case 'Mixed snow and sleet':
    case 'Snow flurries':
    case 'Light snow showers':
    case 'Blowing snow':
    case 'Snow':
    case 'Heavy snow':
    case 'Scattered snow showers':
    case 'Snow showers':
      return 'snowy'

    case 'Freezing drizzle':
    case 'Drizzle':
    case 'Dust':
    case 'Scattered showers':
      return 'rainy'

    case 'Freezing rain':
    case 'Showers':
    case 'Hail':
    case 'Sleet':
    case 'Mixed rain and hail':
      return 'rainy-2'

    case 'Partly cloudy (night)':
    case 'Partly cloudy (day)':
    case 'Partly cloudy':
      return 'cloudy'

    case 'Cold':
    case 'Cloudy':
    case 'Mostly cloudy (night)':
      return 'cloudy-2'

    case 'Foggy':
    case 'Haze':
    case 'Smoky':
    case 'Blustery':
    case 'Windy':
    case 'Mostly cloudy (day)':
      return 'cloudy-3'

    case 'Clear (night)':
    case 'Fair (night)':
      return 'clear'

    case 'Sunny':
    case 'Fair (day)':
    case 'Hot':
      return 'sunny'
  }
}

function weatherCode (code) {
  return {
    description: arr[code],
    icon: icon(arr[code])
  }
}

module.exports = weatherCode
