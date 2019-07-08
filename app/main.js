import { openDB, clearDB } from './db'
import { imageStore } from './store'
import { dom } from './dom'
import { getArtObject } from './art-object'

async function main () {
  navigator.storage.persist()

  await openDB()

  dom.addListeners()

  const artObject = await getArtObject()

  imageStore.dispatch({
    type: 'ADD_ARTOBJECT',
    artObject
  })

  if (artObject.timestamp < Date.now() - (1000 * 60 * 60 * 2)) {
    localStorage.removeItem('imageId')

    const next = await getArtObject()

    imageStore.dispatch({
      type: 'ADD_ARTOBJECT',
      artObject: next
    })
  }

  window.flush = function () {
    localStorage.removeItem('artObjectsId')
    localStorage.removeItem('imageId')
    try { clearDB('images') } catch (err) { console.error(err) }
    try { clearDB('artObjects') } catch (err) { console.error(err) }
  }
}

main()
