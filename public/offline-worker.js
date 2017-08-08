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
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ({

/***/ 7:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* global fetch, self, caches */

if (false) {
  self.addEventListener('install', function (event) {
    // Perform install step:  loading each required file into cache
    return event.waitUntil(caches.open(__version__)
    // Add all offline dependencies to the cache
    .then(function cache() {
      return cache.addAll(['/codsworth/index.html']);
    })
    // At this point everything has been cached
    .then(function () {
      return self.skipWaiting();
    }));
  });

  self.addEventListener('fetch', function (event) {
    return event.respondWith(caches.match(event.request)
    // 1. Cache hit - return the response from the cached version
    // 2. Not in cache - return the result from the live server
    // `fetch` is essentially a "fallback"
    .then(function (res) {
      return res || fetch(event.request);
    }));
  });

  self.addEventListener('activate', function (event) {
    // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
    event.waitUntil(self.clients.claim());

    return event.waitUntil(caches.keys().then(function (keyList) {
      Promise.all(keyList.map(function (key) {
        if ([__version__].indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    }));
  });
}

/***/ })

/******/ });