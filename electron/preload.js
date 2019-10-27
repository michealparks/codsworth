const { ipcRenderer } = require('electron')

const init = () => {
  if (!window.hideUI) {
    return setTimeout(init, 100)
  }

  window.hideUI()

  ipcRenderer.on('replaceArtObject', async () => {
    await window.replaceArtObject()
    console.log('replace')
  })

  ipcRenderer.on('getArtObject', async () => {
    
  })
}

init()
