const { app, Tray, Menu } = require('electron');

let tray;

const constructTray = (background) => {
  tray = new Tray('./dist/icon-dark_32x32.png');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Next artwork',
      type: 'normal',
      click () {
        for (const win of background.all()) {
          win.webContents.send('replaceArtObject');
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
        app.quit();
      }
    }
  ]);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);

  return tray
};

const path = require('path');
const { BrowserWindow } = require('electron');

const constructBackground = (screen) => {
  const windows = [];

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
    });

    win.loadFile('index.html');

    win.once('ready-to-show', () => {
      win.showInactive();
    });

    win.once('closed', () => {
      win = undefined;
    });

    win.openDevTools({ mode: 'detach' });

    windows.push(win);
  }

  const all = () => {
    return windows
  };

  return {
    all
  }
};

const { app: app$1, screen } = require('electron');

app$1.requestSingleInstanceLock();

// if (app.dock) app.dock.hide()

app$1.once('ready', () => {
  const background = constructBackground(screen);
  const tray = constructTray(background);
  
});
