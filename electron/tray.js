const { Tray, Menu, app } = require('electron')

let tray

const constructTray = ({ events, artObject = { title: '' } }) => {
  tray = new Tray('./dist/icon-dark_32x32.png')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: artObject.title,
      click: events.openArtworkLink
    }, {
      label: 'Next Artwork',
      type: 'normal',
      click: events.replaceArtwork
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
    console.log(contextMenu)
    //contextMenu[0].label = str
  }

  return {
    setInfo
  }
}

module.exports = { constructTray }