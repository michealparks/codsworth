const { Tray, Menu } = require('electron');

let tray;

const constructTray = ({ events }) => {
  tray = new Tray('./dist/icon-dark_32x32.png');
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
  ]);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);
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

const { app, screen } = require('electron');

app.requestSingleInstanceLock();

// if (app.dock) app.dock.hide()

const hours = (n) => {
  return n * 1000 * 60 * 60
};

app.once('ready', () => {
  const background = constructBackground(screen);

  const onNext = () => {
    background.next();
  };

  const onToggleBackground = () => {

  };

  const onToggleScreenSaver = () => {

  };

  const onToggleStartup = () => {

  };

  const onQuit = () => {
    app.quit();
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

  setInterval(() => {
    background.next();
  }, hours(3));
});
