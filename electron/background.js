const path = require('path')
const { app, BrowserWindow, ipcMain } = require('electron')

const constructBackground = (screen) => {
  let readyResolver
  let primary

  const readyPromise = new Promise((resolve) => {
    readyResolver = resolve
  })
  const windows = new Set()

  ipcMain.once('backgroundReady', (ev, arg) => {
    console.log(arg)
    readyResolver(arg)
  })

  for (const display of screen.getAllDisplays()) {
    // Create the browser window.
    const win = new BrowserWindow({
      width: display.size.width,
      height: display.size.height,
      x: display.bounds.x,
      y: display.bounds.y,
      enableLargerThanScreen: true,
      center: true,
      show: false,
      frame: false,
      transparent: true,
      webPreferences: {
        preload: path.join(app.getAppPath(), 'preload.js')
      }
    })

    win.loadFile('../dist/index.html')

    win.once('closed', () => {
      windows.delete(win)
    })

    win.openDevTools({ mode: 'detach' })

    windows.add(win)

    if (primary === undefined) primary = win
  }

  const ready = () => {
    return readyPromise
  }

  const next = () => {
    return new Promise((resolve) => {
      primary.webContents.send('replaceArtObject')

      ipcMain.once('artworkReplaced', (e, arg) => {
        resolve(arg)
      })
    })
  }

  const getArtObject = async () => {
    return new Promise((resolve) => {
      primary.webContents.send('getArtObject')

      ipcMain.once('sendArtObject', (e, arg) => {
        resolve(arg)
      })
    })
  }

  return {
    windows,
    ready,
    next,
    getArtObject
  }
}

module.exports = { constructBackground }