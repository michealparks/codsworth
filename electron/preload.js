const { ipcRenderer } = require('electron')

window.onApplicationReady = (api) => {
  api.hideUI()

  ipcRenderer.on('replaceArtObject', async () => {
    const artObject = await api.setCurrentArtObject({ replace: true })

    ipcRenderer.send('artworkReplaced', artObject)
  })

  ipcRenderer.on('getArtObject', () => {
    console.log('bob', api.getCurrentArtObject())
    ipcRenderer.send('sendArtObject', api.getCurrentArtObject())
  })

  ipcRenderer.send('backgroundReady', api.getCurrentArtObject())
}
