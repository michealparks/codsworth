const { app, Tray, Menu } = require('electron')

let tray

export const constructTray = (background) => {
  tray = new Tray('./dist/icon-dark_32x32.png')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Next artwork',
      type: 'normal',
      click () {
        for (const win of background.all()) {
          win.webContents.send('replaceArtObject')
        }
      }
    }, {
      label: 'Background',
      type: 'checkbox'
    }, {
      label: 'ScreenSaver',
      type: 'checkbox'
    }, {
      label: 'Quit',
      role: 'quit',
      type: 'normal',
      click () {
        app.quit()
      }
    }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)

  return tray
}
