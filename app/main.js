import { store } from './store.js'
import { dom } from './dom.js'
import { setCurrentArtObject, replaceArtObject } from './art-object.js'
import { setFullscreenMode } from './fullscreen.js'

const getCurrentArtObject = () => {
  return store.state.currentArtObject
}

const main = async () => {
  navigator.storage.persist()

  await store.initialize()

  dom.addListeners()

  await setCurrentArtObject()

  if (window.onApplicationReady !== undefined) {
    window.onApplicationReady({
      replaceArtObject,
      getCurrentArtObject,
      setCurrentArtObject,
      setFullscreenMode,
      hideUI: dom.hideUI
    })
  }
}

main()
