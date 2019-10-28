const { Tray, Menu, app } = require('electron');

let tray;

const constructTray = ({ events }) => {
  tray = new Tray('./dist/icon-dark_32x32.png');

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

  const next = async () => {
    for (const win of windows) {
      win.webContents.send('replaceArtObject');
    }
  };

  return {
    next
  }
};

const { app: app$1, screen } = require('electron');

app$1.requestSingleInstanceLock();

// if (app.dock) app.dock.hide()

app$1.once('ready', () => {
  const background = constructBackground(screen);

  let nextArtworkId;

  const setTimer = () => {
    if (nextArtworkId) clearInterval(nextArtworkId);

    nextArtworkId = setInterval(() => {
      background.next();
    }, 3 * 1000 * 60 * 60);
  };

  const onNext = () => {
    background.next();
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

  constructTray({
    events: {
      onNext,
      onToggleBackground,
      onToggleScreenSaver,
      onToggleStartup,
      onQuit
    }
  });

  setTimer();
});
