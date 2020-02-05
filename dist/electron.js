const { Tray, Menu, app } = require('electron');

let tray;

const constructTray = ({ events, artObject }) => {
  tray = new Tray('./dist/icon-dark_32x32.png');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: artObject.title
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
  ]);

  tray.setContextMenu(contextMenu);

  const setInfo = (str) => {
    contextMenu[0].label = str;
  };

  return {
    setInfo
  }
};

const path = require('path');
const { BrowserWindow, ipcMain } = require('electron');

const constructBackground = (screen) => {
  let readyResolver;

  const readyPromise = new Promise((resolve) => { readyResolver = resolve; });
  const windows = [];

  ipcMain.once('backgroundReady', (ev, arg) => {
    readyResolver(arg);
  });

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
        preload: path.resolve('./dist/preload.js')
      }
    });

    win.loadFile('index.html');

    {
      win.once('ready-to-show', () => {
        win.showInactive();
      });
    }

    win.once('closed', () => {
      windows.splice(windows.indexOf(win), 1);
    });

    win.openDevTools({ mode: 'detach' });

    windows.push(win);
  }

  const ready = () => {
    return readyPromise
  };

  const next = () => {
    return new Promise((resolve) => {
      windows[0].webContents.send('replaceArtObject');

      ipcMain.once('artworkReplaced', (ev, arg) => {
        resolve(arg);
      });
    })
  };

  const getArtObject = async () => {
    return new Promise((resolve) => {
      windows[0].webContents.send('getArtObject');

      ipcMain.once('sendArtObject', (ev, arg) => {
        resolve(arg);
      });
    })
  };

  return {
    ready,
    next,
    getArtObject
  }
};

const { promisify } = require('util');
const path$1 = require('path');
const childProcess = require('child_process');
const execFile = promisify(childProcess.execFile);

const { app: app$1, screen } = require('electron');

let nextArtworkId;
let background;
let wallpaper;

const setTimer = () => {
  if (nextArtworkId) clearTimeout(nextArtworkId);

  nextArtworkId = setTimeout(replaceArtwork, 3 * 1000 * 60 * 60);
};

const replaceArtwork = async () => {
  const artObject = await background.next();
  console.log('artObject', artObject);

  if (process.platform === 'win32') {
    wallpaper.set();
  }

  setTimer();
};

const onToggleBackground = () => {

};

const onToggleScreenSaver = () => {

};

const onToggleStartup = () => {
  app$1.setLoginItemSettings({
    openAtLogin: !app$1.getLoginItemSettings().openAtLogin
  });
};

const onQuit = () => {
  app$1.quit();
};

const main = async () => {
  background = constructBackground(screen);

  const artObject = await background.ready();

  if (process.platform === 'win32') {
    // wallpaper = constructWallpaper()
    console.log('here');
    console.log(artObject);
  }

  constructTray({
    artObject,
    events: {
      replaceArtwork,
      onToggleBackground,
      onToggleScreenSaver,
      onToggleStartup,
      onQuit
    }
  });

  setTimer();
};

app$1.requestSingleInstanceLock();

if (app$1.dock) app$1.dock.hide();

app$1.on('ready', main);
