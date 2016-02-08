require('es6-promise').polyfill()

import 'whatwg-fetch'
import ready from 'document-ready-promise'
import React from 'react'
import { render } from 'react-dom'
import './services/storage'
import './services/time'
import initConfig from './services/config'
import App from './ui-components/app/index'

React.Component.prototype.hasTouch = 'ontouchend' in window

app()

function app () {
  const root = document.querySelector('#app-root')
  root.requestFullscreen && root.requestFullscreen()
  return Promise.all([initConfig(), ready()])
    .then(() => render(<App />, root))
    .catch(console.error.bind(console))
}
