import { fetch } from './util'
import { db } from './db'
import { artObjectsStore } from './store'

// Note: this is temporarily abandoned
// because met has no-cors set on images >:|
const endpoint = 'https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=11|21'

async function randomArtObject () {
  const artObjects = await getArtObjects()

  if (!artObjects) return

  return removeRandomArtObject(artObjects)
}

async function getArtObjects () {
  const res = await db.get('artObjects', 'met')

  if (res && res.artObjects.length > 0) {
    return res.artObjects
  } else {
    const [err, artObjects] = await fetchObjects()

    if (err) return

    artObjectsStore.dispatch({
      type: 'ADD_ARTOBJECTS',
      artObjects: { key: 'met', artObjects }
    })

    return artObjects
  }
}

async function removeRandomArtObject (artObjects) {
  const [id] = (artObjects.splice(Math.floor(Math.random() * artObjects.length), 1) || [])

  const res = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)

  if (!res) return

  const object = await res.json()

  if (!object.primaryImage) return

  const artObject = {
    src: object.primaryImage,
    title: object.title,
    author: object.artistDisplayName,
    provider: 'The Metropolitan Museum of Art',
    titleLink: object.objectURL,
    providerLink: 'https://www.metmuseum.org',
    blob: undefined,
    timestamp: undefined
  }

  artObjectsStore.dispatch({
    type: 'ADD_ARTOBJECTS',
    artObjects: { key: 'met', artObjects }
  })

  return artObject
}

async function fetchObjects (page) {
  try {
    const res = await fetch(endpoint)

    if (!res) return [true]

    const json = await res.json()

    return [undefined, json.objectIDs]
  } catch (err) {
    console.error(err)
    return [true]
  }
}

export const metmuseum = {
  randomArtObject
}
