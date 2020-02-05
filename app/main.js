import { store } from './store'
import { dom } from './dom'
import { setCurrentArtObject } from './art-object'

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
      getCurrentArtObject,
      setCurrentArtObject,
      hideUI: dom.hideUI
    })
  }
}

main()
