import fetch from 'node-fetch'
import { constructTray } from './tray.js'
import { constructBackground } from './background.js'
import { constructWallpaper } from './wallpaper.js'
import { image } from './image'

globalThis.fetch = fetch

const { app, screen } = require('electron')

let nextArtworkId
let background
let wallpaper

const setTimer = () => {
  if (nextArtworkId) clearTimeout(nextArtworkId)

  nextArtworkId = setTimeout(replaceArtwork, 3 * 1000 * 60 * 60)
}

const replaceArtwork = async () => {
  const artObject = await background.next()
  console.log('artObject', artObject)

  if (process.platform === 'win32') {
    wallpaper.set()
  }

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

const main = async () => {
  background = constructBackground(screen)

  const artObject = await background.ready()

  if (process.platform === 'win32') {
    // wallpaper = constructWallpaper()
    console.log('here')
    console.log(artObject)
    const result = await image.fetch(artObject.src)
    console.log(result)
  }

  constructTray({
    artObject,
    events: {
      replaceArtwork,
      onToggleBackground,
      onToggleScreenSaver,
      onToggleStartup,
      onQuit
    }
  })

  setTimer()
}

app.requestSingleInstanceLock()

if (app.dock) app.dock.hide()

app.on('ready', main)
