import { constructTray } from './tray.js'
import { constructBackground } from './background.js'

const { app, screen } = require('electron')

app.requestSingleInstanceLock()

// if (app.dock) app.dock.hide()

app.once('ready', () => {
  const background = constructBackground(screen)

  let nextArtworkId

  const setTimer = () => {
    if (nextArtworkId) clearInterval(nextArtworkId)

    nextArtworkId = setInterval(() => {
      background.next()
    }, 3 * 1000 * 60 * 60)
  }

  const onNext = () => {
    background.next()
    setTimer()
  }

  const onToggleBackground = () => {

  }

  const onToggleScreenSaver = () => {

  }

  const onToggleStartup = () => {
    app.setLoginItemSettings({
      openAtLogin: !app.getLoginItemSettings().openAtLogin
    })
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

  setTimer()
})
