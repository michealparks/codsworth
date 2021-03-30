require('./config.js')

const os = require('os')
const wallpaper = require('wallpaper')
const { app, screen, powerMonitor } = require('electron')
const { constructTray } = require('./tray.js')
const { constructBackground } = require('./background.js')
const { image } = require('./image.js')
const constants = require('./consts.js')
const { checkForUpdate } = require('./updater.js')

checkForUpdate()
setInterval(checkForUpdate, constants.CHECK_UPDATE_INTERVAL)

app.on('ready', async () => {
  const setArtwork = async (artObject) => {
    const imgPath = await image.fromBuffer(artObject.src, artObject.buffer)
    console.log(imgPath)
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

  console.log(1)

  const artObject = await background.ready()
  await setArtwork(artObject)

  powerMonitor.on('suspend', () => {
    replaceArtwork()
  })
})
