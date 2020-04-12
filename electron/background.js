const path = require('path')
const { BrowserWindow, ipcMain } = require('electron')

const constructBackground = (screen) => {
  let readyResolver

  const readyPromise = new Promise((resolve) => { readyResolver = resolve })
  const windows = []

  ipcMain.once('backgroundReady', (ev, arg) => {
    readyResolver(arg)
  })

  for (const display of screen.getAllDisplays()) {
    // Create the browser window.
    const win = new BrowserWindow({
      type: 'desktop',
      width: display.size.width,
      height: display.size.height + 20,
      x: display.bounds.x,
      y: display.bounds.y - 10,
      enableLargerThanScreen: true,
      center: true,
      show: false,
      frame: false,
      transparent: true,
      webPreferences: {
        preload: path.resolve('./electron/preload.js')
      }
    })

    win.loadFile(path.resolve('./dist/index.html'))

    win.once('closed', () => {
      windows.splice(windows.indexOf(win), 1)
    })

    win.openDevTools({ mode: 'detach' })

    windows.push(win)
  }

  const ready = () => {
    return readyPromise
  }

  const next = () => {
    return new Promise((resolve) => {
      windows[0].webContents.send('replaceArtObject')

      ipcMain.once('artworkReplaced', (ev, arg) => {
        resolve(arg)
      })
    })
  }

  const getArtObject = async () => {
    return new Promise((resolve) => {
      windows[0].webContents.send('getArtObject')

      ipcMain.once('sendArtObject', (ev, arg) => {
        resolve(arg)
      })
    })
  }

  return {
    ready,
    next,
    getArtObject
  }
}

module.exports = { constructBackground }