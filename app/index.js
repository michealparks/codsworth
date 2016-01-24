import 'whatwg-fetch'

import './services/storage'
import './services/time'
import initConfig from './services/config'

import ready from 'document-ready-promise'
import React from 'react'
import { render } from 'react-dom'
import App from './ui-components/app/index'

React.Component.prototype.hasTouch = 'ontouchend' in window

window.React = React

app()

function app () {
  Promise.all([initConfig(), ready()])
    .then(() => render(<App />, document.querySelector('#app-root')))
    .catch(err => {
      return console.log(err)
      window.setTimeout(app, 500)
    })
}
