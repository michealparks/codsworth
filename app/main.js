import { store } from './store.js'
import { dom } from './dom.js'
import { setCurrentArtObject } from './art-object.js'

const getCurrentArtObject = () => {
  const object = store.state.currentArtObject

  return {
    src: object.src,
    title: object.title,
    author: object.author,
    provider: object.provider,
    titleLink: object.titleLink,
    providerLink: object.providerLink
  }
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
