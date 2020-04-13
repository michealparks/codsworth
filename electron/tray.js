const { Tray, Menu, app, shell } = require('electron')

let tray

const constructTray = ({ events }) => {
  tray = new Tray('./dist/icon-dark_32x32.png')

  let link = ''

  const menuTemplate = [
    {
      label: '',
      click: () => {
        if (link) shell.openExternal(link)
      }
    }, {
      label: 'Next Artwork',
      type: 'normal',
      click: events.replaceArtwork
    }, {
      label: 'Add to favorites',
      type: 'normal',
      click: events.replaceArtwork
    }, {
      type: 'separator'
    }, {
      label: 'Options',
      submenu: [
        {
          label: 'Next artwork after:',
          enabled: false
        }, {
          label: 'Suspend',
          type: 'checkbox',
          click: () => {
    
          }
        }, {
          label: 'Sign out',
          type: 'checkbox',
          click: () => {
    
          }
        }, {
          label: 'Shut down',
          type: 'checkbox',
          click: () => {
    
          }
        }, {
          type: 'separator'
        }, {
          label: 'Run On Startup',
          type: 'checkbox',
          checked: app.getLoginItemSettings().openAtLogin,
          click: () => {
            app.setLoginItemSettings({
              openAtLogin: !app.getLoginItemSettings().openAtLogin
            })
          }
        },
      ]
    }, {
      type: 'separator'
    }, {
      label: 'Favorites',
      type: 'normal',
      click: () => {
        
      }
    }, {
      label: 'About',
      role: 'help',
      type: 'normal',
      click: () => {
        
      }
    }, {
      label: 'Quit',
      role: 'quit',
      type: 'normal',
      click: () => {
        app.quit()
      }
    }
  ]

  tray.setContextMenu(Menu.buildFromTemplate(menuTemplate))

  const setArtObject = ({ title, titleLink }) => {
    link = titleLink
    menuTemplate[0].label = title
    tray.setContextMenu(Menu.buildFromTemplate(menuTemplate))
  }

  return {
    setArtObject
  }
}

module.exports = { constructTray }