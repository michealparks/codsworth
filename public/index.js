/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./app/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./app/index.js":
/*!**********************************!*\
  !*** ./app/index.js + 9 modules ***!
  \**********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// CONCATENATED MODULE: ./app/weather/codes-weather.js
const codes = [
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

const icon = (description) => {
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
      return 'clear-night'

    case 'Sunny':
    case 'Fair (day)':
    case 'Hot':
      return 'sunny'
  }
}

const weatherCode = (code) => {
  return {
    description: codes[code],
    icon: icon(codes[code])
  }
}

// CONCATENATED MODULE: ./app/util/time.js
const seconds = (n) => n * 1000
const minutes = (n) => n * 1000 * 60
const hours = (n) => n * 1000 * 60 * 60
const days = (n) => n * 1000 * 60 * 60 * 24

// CONCATENATED MODULE: ./app/util/storage.js
const stringify = JSON.stringify.bind(JSON)
const parse = JSON.parse.bind(JSON)
const get = localStorage.getItem.bind(localStorage)
const set = localStorage.setItem.bind(localStorage)

const noStore = !(() => {
  try {
    const x = '__storage_test__'
    localStorage.setItem(x, x)
    localStorage.removeItem(x)
    return true
  } catch (e) {
    return false
  }
})()

const storage = (key, val) => {
  if (noStore) return undefined

  return val !== undefined
    ? set(key, stringify(val))
    : parse(get(key))
}

// CONCATENATED MODULE: ./app/weather/fetch-weather.js




const baseURL = 'https://query.yahooapis.com/v1/public/yql?format=json&q='

let req, next
let didInit = false
let fetch_weather_weather = storage('weather')
let fetch_weather_location = storage('geolocation')

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
  fetch_weather_location = coords

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

const fetchWeather = (callback) => {
  next = callback

  if (!didInit) return
  if (fetch_weather_weather && (Date.now() - fetch_weather_weather.time) < minutes(30)) {
    return next(null, fetch_weather_weather)
  }

  req = new XMLHttpRequest()
  req.open('GET', typeof fetch_weather_location === 'string'
    ? getCityQueryUrl(fetch_weather_location)
    : getLatLngQueryUrl(fetch_weather_location.latitude, fetch_weather_location.longitude), true)
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

  fetch_weather_weather = {
    temp: channel.item.condition.temp,
    code: weatherCode(channel.item.condition.code),
    time: Date.now()
  }

  storage('weather', fetch_weather_weather)
  return next(null, fetch_weather_weather)
}

const onWeatherError = () => {
  console.warn(req, req.response)
}

getGeolocation()

if (fetch_weather_location) init()

// CONCATENATED MODULE: ./app/weather/index.js




const container = document.getElementById('weather')
const temp = container.children[0]
const unit = container.children[1]
const weather_icon = container.children[2]

let temperature
let userUnits = storage('settings:weather-units') || 'C'

const makeIcon = (code) => {
  return `<svg><use xlink:href='#icon-${code}'></use></svg>`
}

const weather_onWeatherFetch = (err, weather) => {
  if (!weather) return

  if (err) return setTimeout(fetchWeather, minutes(2), weather_onWeatherFetch)

  temperature = weather.temp
  temp.textContent = convertUnits(temperature)
  unit.textContent = `\u00B0 ${userUnits}`
  weather_icon.innerHTML = makeIcon(weather.code.icon || '')

  return setTimeout(fetchWeather, minutes(30))
}

const convertUnits = (n) => {
  return userUnits === 'F' ? n : ((n - 32) * 5 / 9).toFixed(1)
}

container.onclick = () => {
  userUnits = (userUnits === 'F') ? 'C' : 'F'
  temp.textContent = convertUnits(temperature)
  unit.textContent = `\u00B0 ${userUnits}`

  storage('settings:weather-units', userUnits)
}

weather_onWeatherFetch(storage('weather'))
fetchWeather(weather_onWeatherFetch)

// CONCATENATED MODULE: ./app/bg-image/store.js
let db, store_didInit, didFail, store_callback

if (window.indexedDB !== undefined) {
  const req = window.indexedDB.open('codsworth', 1)

  req.onsuccess = (event) => {
    db = req.result

    db.onerror = (event) => {
      // TODO
    }

    store_didInit = true

    if (store_callback) getImageBlob(store_callback)
  }

  req.onupgradeneeded = (event) => {
    const objectStore = event.target.result.createObjectStore('images')

    objectStore.createIndex('image', 'image', { unique: false })

    event.target.transaction.oncomplete = (event) => {}
  }
} else {
  didFail = true
}

const setImageBlob = (blob) => {
  db.transaction(['images'], 'readwrite')
    .objectStore('images')
    .put(blob, 'image')
}

const getImageBlob = (next) => {
  if (didFail) {
    return next(true)
  }

  if (!store_didInit) {
    store_callback = next
    return
  }

  db.transaction(['images'], 'readwrite')
    .objectStore('images')
    .get('image')
    .onsuccess = (event) => next(null, event.target.result)
}

// CONCATENATED MODULE: ./app/bg-image/index.js




const bg = [document.getElementById('bg-0'), document.getElementById('bg-1')]
const bgCL = bg[1].classList
const bg_image_text = document.getElementById('text')
const Img = new window.Image()
const wikiURL = 'https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=Main_Page&format=json&origin=*'
const imageData = storage('image')
const parser = new DOMParser()

let textHTML
let i = 0

getImageBlob((err, blob) => {
  if (err || !imageData || (Date.now() - imageData.time) >= days(1)) {
    makeImageRequest()
  }

  if (!blob || !imageData) return

  renderImage(URL.createObjectURL(blob), imageData.text)
})

const makeImageRequest = () => {
  setTimeout(makeImageRequest, days(1))

  makeRequest('json', wikiURL, onMainPageErr, onMainPageLoad)
}

const makeRequest = (type, url, onerror, onload) => {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.responseType = type
  xhr.onerror = onerror
  xhr.ontimeout = onerror
  xhr.onload = () => onload(xhr.response)
  xhr.send()
}

const onMainPageErr = () => {
  // add 503 handling
}

const onMainPageLoad = (response) => {
  const doc = parser.parseFromString(response.parse.text['*'], 'text/html')
  const section = doc.querySelector('#mp-lower')
  const imageURL = section.querySelector('img').getAttribute('src').split('/')
  const size = imageURL.pop().replace(/^[0-9]{3,4}px/, '2400px')
  const url = 'https:' + imageURL.join('/') + '/' + size

  makeRequest('blob', url, onImageErr, onImageLoad)

  const description = section.querySelector('p')
  const links = description.querySelectorAll('a')

  for (let el, i = 0, l = links.length; i < l; ++i) {
    el = links[i]
    el.setAttribute('href', 'https://wikipedia.org' + el.getAttribute('href'))
    el.setAttribute('target', '_blank')
  }

  textHTML = description.innerHTML
}

const onImageLoad = (response) => {
  const imgURL = URL.createObjectURL(response)

  renderImage(imgURL, textHTML)

  setImageBlob(response)

  storage('image', {
    text: textHTML,
    time: Date.now()
  })
}

const onImageErr = () => {

}

const renderImage = (url, html) => {
  i = (i + 1) % 2
  bg[i].style.backgroundImage = `url("${url}")`
  bg_image_text.innerHTML = html

  Img.onload = () => bgCL.toggle('bg-image--active', i === 1)
  Img.src = url
}

// CONCATENATED MODULE: ./app/time/conversions.js
const expandDay = (d) => {
  switch (d) {
    case 'Mon': return 'Monday'
    case 'Tue': return 'Tuesday'
    case 'Wed': return 'Wednesday'
    case 'Thu': return 'Thursday'
    case 'Fri': return 'Friday'
    case 'Sat': return 'Saturday'
    case 'Sun': return 'Sunday'
  }
}

const numMonth = (m) => {
  switch (m) {
    case 'Jan': return 1
    case 'Feb': return 2
    case 'Mar': return 3
    case 'Apr': return 4
    case 'May': return 5
    case 'Jun': return 6
    case 'Jul': return 7
    case 'Aug': return 8
    case 'Sep': return 9
    case 'Oct': return 10
    case 'Nov': return 11
    case 'Dec': return 12
  }
}

const expandMonth = (m) => {
  switch (m) {
    case 'Jan': return 'January'
    case 'Feb': return 'February'
    case 'Mar': return 'March'
    case 'Apr': return 'April'
    case 'May': return 'May'
    case 'Jun': return 'June'
    case 'Jul': return 'July'
    case 'Aug': return 'August'
    case 'Sep': return 'September'
    case 'Oct': return 'October'
    case 'Nov': return 'November'
    case 'Dec': return 'December'
  }
}

// CONCATENATED MODULE: ./app/time/index.js



const time = document.getElementById('time')
const date = document.getElementById('date')
let timeFormat = storage('settings:time-format') || '24hr'
let dateFormat = storage('settings:date-format') || 'words'
let t, d, s, suffix

const tick = (once) => {
  d = new Date().toString().split(' ')

  if (timeFormat === '24hr') {
    time.textContent = d[4].split(':').slice(0, -1).join('.')
  } else {
    t = d[4].split(':')
    s = (+t[0] < 12 ? 'AM' : 'PM')
    t[0] = +t[0] % 12 || 12
    time.textContent = t.slice(0, -1).join('.')

    if (s !== suffix) {
      time.classList.toggle('am', s === 'AM')
      time.classList.toggle('pm', s === 'PM')
      suffix = s
    }
  }

  if (dateFormat === 'numbers') {
    date.textContent = `${d[2]} / ${numMonth(d[1])} / ${d[3].slice(2)}`
  } else {
    date.textContent = `${expandDay(d[0])}, ${expandMonth(d[1])} ${d[2]}, ${d[3]}`
  }

  return once ? null : setTimeout(tick, 1000)
}

time.onclick = () => {
  timeFormat = (timeFormat === '24hr') ? '12hr' : '24hr'
  suffix = null

  if (timeFormat === '24hr') time.classList.remove('am', 'pm')

  tick(true)
  storage('settings:time-format', timeFormat)
}

date.onclick = () => {
  dateFormat = (dateFormat === 'words') ? 'numbers' : 'words'

  tick(true)
  storage('settings:date-format', dateFormat)
}

tick()

// CONCATENATED MODULE: ./app/index.js




if (navigator.serviceWorker !== undefined) {
  // Listen for claiming of our ServiceWorker
  navigator.serviceWorker.addEventListener('controllerchange', (event) =>
    // Listen for changes in the state of our ServiceWorker
    navigator.serviceWorker.controller.addEventListener('statechange', () => {
      // nothing
    })
  )

  navigator.serviceWorker.register('offline-worker.js')
    .then((registration) => {
      // The service worker has been registered!
    })
    .catch((err) => console.error(err))
}


/***/ })

/******/ });