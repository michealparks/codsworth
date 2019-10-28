const { Tray, Menu, app } = require('electron')

let tray

export const constructTray = ({ events }) => {
  tray = new Tray('./dist/icon-dark_32x32.png')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Loading...'
    }, {
      label: 'Next Artwork',
      type: 'normal',
      click: events.onNext
    }, {
      type: 'separator'
    }, {
      label: 'Active Features',
      enabled: false
    }, {
      label: 'Background',
      type: 'checkbox',
      click: events.onToggleBackground
    }, {
      label: 'Screen Saver',
      type: 'checkbox',
      click: events.onToggleScreenSaver
    }, {
      type: 'separator'
    }, {
      label: 'Run On Startup',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: events.onToggleStartup
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      role: 'quit',
      type: 'normal',
      click: events.onQuit
    }
  ])

  tray.setContextMenu(contextMenu)

  const setInfo = (str) => {
    contextMenu[0].label = str
  }

  return {
    setInfo
  }
}
