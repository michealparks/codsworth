import { constructTray } from './tray.js'
import { constructBackground } from './background.js'

const { app, screen } = require('electron')

app.requestSingleInstanceLock()

// if (app.dock) app.dock.hide()

app.once('ready', () => {
  const background = constructBackground(screen)
  const tray = constructTray(background)
  
})
