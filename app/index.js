import 'whatwg-fetch'

import './services/storage'
import './services/time'
import './services/wikipedia'
import initConfig from './services/config'

import ready from 'document-ready-promise'
import React from 'react'
import { render } from 'react-dom'
import App from './ui-components/app/index'

Promise.all([initConfig(), ready()]).then(() =>
  render(<App />, document.querySelector('#app-root'))
)
