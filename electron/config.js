const fetch = require('node-fetch')
const { app } = require('electron')

globalThis.fetch = fetch

// https://www.electronjs.org/docs/api/app#apprequestsingleinstancelock
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
  process.exit(0)
}

app.allowRendererProcessReuse = true

if (app.dock) {
  app.dock.hide()
}
