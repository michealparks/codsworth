const path = require('path')
const { BrowserWindow } = require('electron')

export const constructBackground = (screen) => {
  const windows = []

  for (const display of screen.getAllDisplays()) {
    // Create the browser window.
    let win = new BrowserWindow({
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
        preload: path.resolve('./dist/preload.js')
      }
    })

    win.loadFile('index.html')

    win.once('ready-to-show', () => {
      win.showInactive()
    })

    win.once('closed', () => {
      win = undefined
    })

    win.openDevTools({ mode: 'detach' })

    windows.push(win)
  }

  const next = async () => {
    for (const win of windows) {
      win.webContents.send('replaceArtObject')
    }
  }

  return {
    next
  }
}