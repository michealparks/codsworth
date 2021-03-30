import { store } from './store.js'
import { dom } from './dom.js'
import { setCurrentArtObject, replaceArtObject } from './art-object.js'
import { setFullscreenMode } from './fullscreen.js'

const getCurrentArtObject = async () => {
  const object = store.state.currentArtObject
  object.buffer = await object.blob.arrayBuffer()
  return object
}

const main = async () => {
  navigator.storage.persist()

  await store.initialize()

  dom.addListeners()

  await setCurrentArtObject()

  if (window.galeri !== undefined) {
    window.galeri.ready({
      replaceArtObject,
      getCurrentArtObject,
      setCurrentArtObject,
      setFullscreenMode,
      hideUI: dom.hideUI
    })
  }
}

main()
