import { constructTray } from './tray.js'
import { constructBackground } from './background.js'

const { app, screen } = require('electron')

app.requestSingleInstanceLock()

// if (app.dock) app.dock.hide()

const hours = (n) => {
  return n * 1000 * 60 * 60
}

app.once('ready', () => {
  const background = constructBackground(screen)

  const onNext = () => {
    background.next()
  }

  const onToggleBackground = () => {

  }

  const onToggleScreenSaver = () => {

  }

  const onToggleStartup = () => {

  }

  const onQuit = () => {
    app.quit()
  }

  constructTray({
    events: {
      onNext,
      onToggleBackground,
      onToggleScreenSaver,
      onToggleStartup,
      onQuit
    }
  })

  setInterval(() => {
    background.next()
  }, hours(3))
})
