const { ipcRenderer } = require('electron')

const prepareArtObject = async ({
  src,
  title,
  author,
  provider,
  titleLink,
  providerLink,
  blob
}) => {
  return {
    buffer: await blob.arrayBuffer(),
    src,
    title,
    author,
    provider,
    titleLink,
    providerLink
  }
}

window.onApplicationReady = async (api) => {
  api.hideUI()

  ipcRenderer.on('replaceArtObject', async () => {
    const artObject = await api.replaceArtObject()
    const toSend = await prepareArtObject(artObject)
    ipcRenderer.send('artworkReplaced', toSend)
  })

  ipcRenderer.on('getArtObject', async () => {
    const artObject = api.getCurrentArtObject()
    const toSend = await prepareArtObject(artObject)
    ipcRenderer.send('sendArtObject', toSend)
  })

  const artObject = api.getCurrentArtObject()
  const toSend = await prepareArtObject(artObject)
  console.log(toSend)
  ipcRenderer.send('backgroundReady', toSend)
}
