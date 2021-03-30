const { contextBridge, ipcRenderer } = require('electron')

const ready = async (api) => {
  api.hideUI()

  ipcRenderer.on('replaceArtObject', async () => {
    await api.replaceArtObject()
    const artObject = await api.getCurrentArtObject()
    ipcRenderer.send('artworkReplaced', artObject)
  })

  ipcRenderer.on('getArtObject', async () => {
    const artObject = await api.getCurrentArtObject()
    ipcRenderer.send('sendArtObject', artObject)
  })

  const artObject = await api.getCurrentArtObject()
  ipcRenderer.send('backgroundReady', artObject)
}

contextBridge.exposeInMainWorld('galeri', { ready })

