require('./config.js')
require('./updater.js')
const wallpaper = require('wallpaper')
const { app, screen } = require('electron')
const { constructTray } = require('./tray.js')
const { constructBackground } = require('./background.js')
const { image } = require('./image')

app.on('ready', async () => {
  const setArtwork = async ({ src, buffer, title }) => {
    const imgPath = await image.fromBuffer(src, buffer)
    await wallpaper.set(imgPath)

    tray.setInfo({ title })
  }

  const replaceArtwork = async () => {
    const artObject = await background.next()
    console.log('!!!!!!!!!!', artObject)
    await setArtwork(artObject)
  }

  const openArtworkLink = () => {

  }

  const background = constructBackground(screen)

  const tray = constructTray({
    events: {
      openArtworkLink,
      replaceArtwork,
      onToggleBackground: () => {},
      onToggleScreenSaver: () => {},
      onToggleStartup: () => app.setLoginItemSettings({
        openAtLogin: !app.getLoginItemSettings().openAtLogin
      }),
      onQuit: () => app.quit()
    }
  })

  await background.ready()
  await replaceArtwork()
})
