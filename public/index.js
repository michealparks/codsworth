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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = storage;

const stringify = JSON.stringify.bind(JSON);
const parse = JSON.parse.bind(JSON);
const get = localStorage.getItem.bind(localStorage);
const set = localStorage.setItem.bind(localStorage);

const noStore = !(() => {
  try {
    const x = '__storage_test__';
    localStorage.setItem(x, x);
    localStorage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
})();

function storage(key, val) {
  if (noStore) return undefined;

  return val !== undefined ? set(key, stringify(val)) : parse(get(key));
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  seconds: n => n * 1000,
  minutes: n => n * 1000 * 60,
  hours: n => n * 1000 * 60 * 60,
  days: n => n * 1000 * 60 * 60 * 24
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* global URL, XMLHttpRequest */
const storage = __webpack_require__(0);
const db = __webpack_require__(5);
const { days } = __webpack_require__(1);
const bg = [document.getElementById('bg-0'), document.getElementById('bg-1')];
const bgCL = bg[1].classList;
const text = document.getElementById('text');
const Img = new window.Image();
const wikiURL = 'https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=Main_Page&format=json&origin=*';
const imageData = storage('image');
const parser = new DOMParser();

let textHTML;
let i = 0;

db.getImageBlob((err, blob) => {
  if (err || !imageData || Date.now() - imageData.time >= days(1)) {
    makeImageRequest();
  }

  if (!blob || !imageData) return;

  renderImage(URL.createObjectURL(blob), imageData.text);
});

function makeImageRequest() {
  setTimeout(makeImageRequest, days(1));

  makeRequest('json', wikiURL, onMainPageErr, onMainPageLoad);
}

function makeRequest(type, url, onerror, onload) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = type;
  xhr.onerror = onerror;
  xhr.ontimeout = onerror;
  xhr.onload = onload;
  xhr.send();
}

function onMainPageErr() {
  // add 503 handling
}

function onMainPageLoad() {
  const doc = parser.parseFromString(this.response.parse.text['*'], 'text/html');
  const section = doc.querySelector('#mp-lower');
  const imageURL = section.querySelector('img').getAttribute('src').split('/');
  const size = imageURL.pop().replace(/^[0-9]{3,4}px/, '2400px');
  const url = 'https:' + imageURL.join('/') + '/' + size;

  makeRequest('blob', url, onImageErr, onImageLoad);

  const description = section.querySelector('p');
  const links = description.querySelectorAll('a');

  for (let el, i = 0, l = links.length; i < l; ++i) {
    el = links[i];
    el.setAttribute('href', 'https://wikipedia.org' + el.getAttribute('href'));
    el.setAttribute('target', '_blank');
  }

  textHTML = description.innerHTML;
}

function onImageLoad() {
  const imgURL = URL.createObjectURL(this.response);

  renderImage(imgURL, textHTML);

  db.setImageBlob(this.response);

  storage('image', {
    text: textHTML,
    time: Date.now()
  });
}

function onImageErr() {}

function renderImage(url, html) {
  i = (i + 1) % 2;
  bg[i].style.backgroundImage = `url("${url}")`;
  text.innerHTML = html;

  Img.onload = () => bgCL.toggle('bg-image--active', i === 1);
  Img.src = url;
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const storage = __webpack_require__(0);
const { expandDay, numMonth, expandMonth } = __webpack_require__(8);
const time = document.getElementById('time');
const date = document.getElementById('date');

let timeFormat = storage('settings:time-format') || '24hr';
let dateFormat = storage('settings:date-format') || 'words';
let t, d, s, suffix;

tick();

function tick(once) {
  d = new Date().toString().split(' ');

  if (timeFormat === '24hr') {
    time.textContent = d[4].split(':').slice(0, -1).join('.');
  } else {
    t = d[4].split(':');
    s = +t[0] < 12 ? 'AM' : 'PM';
    t[0] = +t[0] % 12 || 12;
    time.textContent = t.slice(0, -1).join('.');

    if (s !== suffix) {
      time.classList.toggle('am', s === 'AM');
      time.classList.toggle('pm', s === 'PM');
      suffix = s;
    }
  }

  if (dateFormat === 'numbers') {
    date.textContent = `${d[2]} / ${numMonth(d[1])} / ${d[3].slice(2)}`;
  } else {
    date.textContent = `${expandDay(d[0])}, ${expandMonth(d[1])} ${d[2]}, ${d[3]}`;
  }

  return once ? null : setTimeout(tick, 1000);
}

time.onclick = () => {
  timeFormat = timeFormat === '24hr' ? '12hr' : '24hr';
  suffix = null;

  if (timeFormat === '24hr') time.classList.remove('am', 'pm');

  tick(true);
  storage('settings:time-format', timeFormat);
};

date.onclick = () => {
  dateFormat = dateFormat === 'words' ? 'numbers' : 'words';

  tick(true);
  storage('settings:date-format', dateFormat);
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const fetchWeather = __webpack_require__(10).fetchWeather.bind(undefined, onWeatherFetch);
const storage = __webpack_require__(0);
const { minutes } = __webpack_require__(1);
const container = document.getElementById('weather');
const temp = container.children[0];
const unit = container.children[1];
const icon = container.children[2];

let temperature;
let userUnits = storage('settings:weather-units') || 'C';

onWeatherFetch(storage('weather'));
fetchWeather();

function makeIcon(code) {
  return `<svg><use xlink:href='#icon-${code}'></use></svg>`;
}

function onWeatherFetch(err, weather) {
  if (!weather) return;

  if (err) return setTimeout(fetchWeather, minutes(2));

  temperature = weather.temp;
  temp.textContent = convertUnits(temperature);
  unit.textContent = `\u00B0 ${userUnits}`;
  icon.innerHTML = makeIcon(weather.code.icon || '');

  return setTimeout(fetchWeather, minutes(30));
}

function convertUnits(n) {
  return userUnits === 'F' ? n : ((n - 32) * 5 / 9).toFixed(1);
}

container.onclick = () => {
  userUnits = userUnits === 'F' ? 'C' : 'F';
  temp.textContent = convertUnits(temperature);
  unit.textContent = `\u00B0 ${userUnits}`;

  storage('settings:weather-units', userUnits);
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = { setImageBlob, getImageBlob };

let db, didInit, didFail, callback;

if (window.indexedDB !== undefined) {
  const req = window.indexedDB.open('codsworth', 1);

  req.onsuccess = event => {
    db = req.result;

    db.onerror = event => {
      // TODO
    };

    didInit = true;

    if (callback) getImageBlob(callback);
  };

  req.onupgradeneeded = event => {
    const objectStore = event.target.result.createObjectStore('images');

    objectStore.createIndex('image', 'image', { unique: false });

    event.target.transaction.oncomplete = event => {};
  };
} else {
  didFail = true;
}

function setImageBlob(blob) {
  db.transaction(['images'], 'readwrite').objectStore('images').put(blob, 'image');
}

function getImageBlob(next) {
  if (didFail) {
    return next(true);
  }

  if (!didInit) {
    callback = next;
    return;
  }

  db.transaction(['images'], 'readwrite').objectStore('images').get('image').onsuccess = event => next(null, event.target.result);
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(4);
__webpack_require__(2);
__webpack_require__(3);

if (navigator.serviceWorker !== undefined) {
  // Listen for claiming of our ServiceWorker
  navigator.serviceWorker.addEventListener('controllerchange', event =>
  // Listen for changes in the state of our ServiceWorker
  navigator.serviceWorker.controller.addEventListener('statechange', () => {
    // nothing
  }));

  navigator.serviceWorker.register('offline-worker.js').then(registration => {
    // The service worker has been registered!
  }).catch(err => console.error(err));
}

/***/ }),
/* 7 */,
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = { expandDay, numMonth, expandMonth };

function expandDay(d) {
  switch (d) {
    case 'Mon':
      return 'Monday';
    case 'Tue':
      return 'Tuesday';
    case 'Wed':
      return 'Wednesday';
    case 'Thu':
      return 'Thursday';
    case 'Fri':
      return 'Friday';
    case 'Sat':
      return 'Saturday';
    case 'Sun':
      return 'Sunday';
  }
}

function numMonth(m) {
  switch (m) {
    case 'Jan':
      return 1;
    case 'Feb':
      return 2;
    case 'Mar':
      return 3;
    case 'Apr':
      return 4;
    case 'May':
      return 5;
    case 'Jun':
      return 6;
    case 'Jul':
      return 7;
    case 'Aug':
      return 8;
    case 'Sep':
      return 9;
    case 'Oct':
      return 10;
    case 'Nov':
      return 11;
    case 'Dec':
      return 12;
  }
}

function expandMonth(m) {
  switch (m) {
    case 'Jan':
      return 'January';
    case 'Feb':
      return 'February';
    case 'Mar':
      return 'March';
    case 'Apr':
      return 'April';
    case 'May':
      return 'May';
    case 'Jun':
      return 'June';
    case 'Jul':
      return 'July';
    case 'Aug':
      return 'August';
    case 'Sep':
      return 'September';
    case 'Oct':
      return 'October';
    case 'Nov':
      return 'November';
    case 'Dec':
      return 'December';
  }
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = weatherCode;

let codes = ['Tornado', 'Tropical storm', 'Hurricane', 'Severe thunderstorms', 'Thunderstorms', 'Mixed rain and snow', 'Mixed rain and sleet', 'Mixed snow and sleet', 'Freezing drizzle', 'Drizzle', 'Freezing rain', 'Showers', 'Showers', 'Snow flurries', 'Light snow showers', 'Blowing snow', 'Snow', 'Hail', 'Sleet', 'Dust', 'Foggy', 'Haze', 'Smoky', 'Blustery', 'Windy', 'Cold', 'Cloudy', 'Mostly cloudy (night)', 'Mostly cloudy (day)', 'Partly cloudy (night)', 'Partly cloudy (day)', 'Clear (night)', 'Sunny', 'Fair (night)', 'Fair (day)', 'Mixed rain and hail', 'Hot', 'Isolated thunderstorms', 'Scattered thunderstorms', 'Scattered thunderstorms', 'Scattered showers', 'Heavy snow', 'Scattered snow showers', 'Heavy snow', 'Partly cloudy', 'Thundershowers', 'Snow showers', 'Isolated thundershowers'];

function icon(description) {
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
      return 'stormy';

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
      return 'snowy';

    case 'Freezing drizzle':
    case 'Drizzle':
    case 'Dust':
    case 'Scattered showers':
      return 'rainy';

    case 'Freezing rain':
    case 'Showers':
    case 'Hail':
    case 'Sleet':
    case 'Mixed rain and hail':
      return 'rainy-2';

    case 'Partly cloudy (night)':
    case 'Partly cloudy (day)':
    case 'Partly cloudy':
      return 'cloudy';

    case 'Cold':
    case 'Cloudy':
    case 'Mostly cloudy (night)':
      return 'cloudy-2';

    case 'Foggy':
    case 'Haze':
    case 'Smoky':
    case 'Blustery':
    case 'Windy':
    case 'Mostly cloudy (day)':
      return 'cloudy-3';

    case 'Clear (night)':
    case 'Fair (night)':
      return 'clear-night';

    case 'Sunny':
    case 'Fair (day)':
    case 'Hot':
      return 'sunny';
  }
}

function weatherCode(code) {
  return {
    description: codes[code],
    icon: icon(codes[code])
  };
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = { fetchWeather, getGeolocation };

const weatherCode = __webpack_require__(9);
const { minutes } = __webpack_require__(1);
const storage = __webpack_require__(0);
const baseURL = 'https://query.yahooapis.com/v1/public/yql?format=json&q=';

let req, next;
let didInit = false;
let weather = storage('weather');
let location = storage('geolocation');

getGeolocation();

if (location) init();

function init() {
  didInit = true;
  return next ? fetchWeather(next) : null;
}

function getGeolocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(onGetPosition, onGetPositionErr);
  }
}

function onGetPosition({ coords }) {
  storage('geolocation', {
    time: Date.now(),
    latitude: coords.latitude,
    longitude: coords.longitude
  });
  location = coords;

  return init();
}

function onGetPositionErr(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
    case error.POSITION_UNAVAILABLE:
    case error.TIMEOUT:
    case error.UNKNOWN_ERROR:
      return;
  }
}

function fetchWeather(callback) {
  next = callback;

  if (!didInit) return;
  if (weather && Date.now() - weather.time < minutes(30)) {
    return next(null, weather);
  }

  req = new XMLHttpRequest();
  req.open('GET', typeof location === 'string' ? getCityQueryUrl(location) : getLatLngQueryUrl(location.latitude, location.longitude), true);
  req.responseType = 'json';
  req.onload = onWeatherFetch;
  req.onerror = onWeatherError;

  return req.send();
}

function getLatLngQueryUrl(lat, lng) {
  return baseURL + 'select * from weather.forecast where woeid in (SELECT woeid FROM geo.places(1) WHERE text="(' + lat + ',' + lng + ')")';
}

function getCityQueryUrl(q) {
  return baseURL + 'select * from weather.forecast where u="c" AND woeid in (select woeid from geo.places(1) WHERE text="' + q + '")';
}

function onWeatherFetch() {
  const channel = req.response.query.results.channel;

  if (channel.description === 'Yahoo! Weather Error') {
    return next(channel.item.description);
  }

  weather = {
    temp: channel.item.condition.temp,
    code: weatherCode(channel.item.condition.code),
    time: Date.now()
  };

  storage('weather', weather);
  return next(null, weather);
}

function onWeatherError() {
  console.warn(req, req.response);
}

/***/ })
/******/ ]);