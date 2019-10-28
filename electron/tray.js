const { Tray, Menu } = require('electron')

let tray

export const constructTray = ({ events }) => {
  tray = new Tray('./dist/icon-dark_32x32.png')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Next artwork',
      type: 'normal',
      click: events.onNext
    }, {
      label: 'Background',
      type: 'checkbox',
      click: events.onToggleBackground
    }, {
      label: 'ScreenSaver',
      type: 'checkbox',
      click: events.onToggleScreenSaver
    }, {
      label: 'Run on startup',
      type: 'checkbox',
      checked: true,
      click: events.onToggleStartup
    }, {
      label: 'Quit',
      role: 'quit',
      type: 'normal',
      click: events.onQuit
    }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
}
