import { fetchJSON } from './util'
import { db } from './db'
import { artObjectsStore } from './store'

// Note: this is temporarily abandoned
// because met has no-cors set on images >:|
const endpoint = 'https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=11|21'

const randomArtObject = async () => {
  const artObjects = await getArtObjects()

  if (!artObjects) return

  return removeRandomArtObject(artObjects)
}

const getArtObjects = async () => {
  const res = await db.get('artObjects', 'met')

  if (res && res.artObjects.length > 0) {
    return res.artObjects
  } else {
    const [err, json] = await fetchJSON(endpoint)

    if (err) return

    const artObjects = json.objectIDs

    artObjectsStore.dispatch({
      type: 'ADD_ARTOBJECTS',
      artObjects: { key: 'met', artObjects }
    })

    return artObjects
  }
}

const removeRandomArtObject = async (artObjects) => {
  const [id] = (artObjects.splice(Math.floor(Math.random() * artObjects.length), 1) || [])
  const [err, object] = await fetchJSON(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)

  if (err) return
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

export const metmuseum = {
  randomArtObject
}
