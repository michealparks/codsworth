require('./config.js')
require('./updater.js')

const wallpaper = require('wallpaper')
const { app, screen, powerMonitor } = require('electron')
const { constructTray } = require('./tray.js')
const { constructBackground } = require('./background.js')
const { image } = require('./image.js')

app.on('ready', async () => {
  const setArtwork = async (artObject) => {
    const imgPath = await image.fromBuffer(artObject.src, artObject.buffer)
    await wallpaper.set(imgPath)

    tray.setArtObject(artObject)
  }

  const replaceArtwork = async () => {
    const artObject = await background.next()
    console.log('!!!!!!!!!!', artObject)
    await setArtwork(artObject)
  }

  const background = constructBackground(screen)

  const tray = constructTray({
    events: {
      replaceArtwork
    }
  })

  const artObject = await background.ready()
  await setArtwork(artObject)

  powerMonitor.on('suspend', () => {
    replaceArtwork()
  })

  powerMonitor.on()
})
