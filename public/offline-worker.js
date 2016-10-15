/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/* global fetch, self, caches */

	var _require = __webpack_require__(10);

	var version = _require.version;


	self.addEventListener('install', function (event) {
	  console.log('install');
	  // Perform install step:  loading each required file into cache
	  return event.waitUntil(caches.open(version)
	  // Add all offline dependencies to the cache
	  .then(function (cache) {
	    console.log('cache', cache);
	    return cache.addAll(['/index.html']);
	  })
	  // At this point everything has been cached
	  .then(function () {
	    console.log(self);
	    return self.skipWaiting();
	  }));
	});

	if (false) {
	  self.addEventListener('fetch', function (event) {
	    console.log('fetch', event);
	    return event.respondWith(caches.match(event.request)
	    // 1. Cache hit - return the response from the cached version
	    // 2. Not in cache - return the result from the live server
	    // `fetch` is essentially a "fallback"
	    .then(function (res) {
	      return res || fetch(event.request).then(function (response) {
	        return caches.open(version).then(function (cache) {
	          cache.put(event.request, response.clone());
	          return response;
	        });
	      });
	    }));
	  });
	}

	self.addEventListener('activate', function (event) {
	  // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
	  event.waitUntil(self.clients.claim());

	  return event.waitUntil(caches.keys().then(function (keyList) {
	    return Promise.all(keyList.map(function (key) {
	      if ([version].indexOf(key) === -1) {
	        return caches.delete(key);
	      }
	    }));
	  }));
	});

/***/ },

/***/ 10:
/***/ function(module, exports) {

	module.exports = {
		"name": "codsworth",
		"version": "0.0.3",
		"repository": "michealparks/codsworth",
		"description": "A slim wallpaper app.",
		"license": "",
		"scripts": {
			"tasks:dev": "cross-env NODE_ENV=development node tasks",
			"tasks:prod": "cross-env NODE_ENV=production node tasks",
			"webpack:dev": "cross-env NODE_ENV=development webpack --watch --progress --colors",
			"webpack:prod": "cross-env NODE_ENV=production webpack",
			"styl:dev": "stylus --watch app/index.styl --out public/index.css",
			"styl:prod": "stylus --compress < app/index.styl > public/index.css",
			"dev": "concurrently \"npm run tasks:dev\" \"node server\" \"npm run styl:dev\" \"npm run webpack:dev\"",
			"prod": "npm run build && NODE_ENV=production node server",
			"build": "npm run webpack:prod && npm run styl:prod && npm run tasks:prod",
			"deploy:major": "npm version major && npm run build && gh-pages -d public",
			"deploy:minor": "npm version minor && npm run build && gh-pages -d public",
			"deploy:patch": "npm version patch && npm run build && gh-pages -d public"
		},
		"dependencies": {},
		"devDependencies": {
			"babel-loader": "^6.2.5",
			"babel-plugin-transform-strict-mode": "^6.11.3",
			"babel-preset-es2015": "^6.16.0",
			"babili-webpack-plugin": "0.0.5",
			"concurrently": "^3.1.0",
			"cross-env": "^3.1.2",
			"express": "^4.14.0",
			"gh-pages": "^0.11.0",
			"inline-source": "^5.1.1",
			"json-loader": "^0.5.4",
			"morgan": "^1.7.0",
			"stylus": "^0.54.5",
			"webpack": "^1.13.2",
			"webpack-validator": "^2.2.9"
		}
	};

/***/ }

/******/ });