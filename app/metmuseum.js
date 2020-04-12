import { fetchJSON } from '../util/fetch.js'
import { store } from './store.js'

// Note: this is temporarily abandoned
// because met has no-cors set on images >:|
const collectionURL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=11|21'
const objectURL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects'

const randomArtObject = async () => {
  const artObjects = await getArtObjects()

  if (!artObjects) return

  return removeRandomArtObject(artObjects)
}

const getArtObjects = async () => {
  if (store.state.artObjects.length > 0) {
    return store.state.artObjects
  } else {
    let json
    try {
      json = await fetchJSON(collectionURL)
    } catch {
      return
    }

    const artObjects = json.objectIDs

    store.dispatch({
      type: 'setMetArtObjects',
      artObjects
    })

    return artObjects
  }
}

const removeRandomArtObject = async (artObjects) => {
  const [id] = (artObjects.splice(Math.floor(Math.random() * artObjects.length), 1) || [])

  let object
  try {
    object = await fetchJSON(`${objectURL}/${id}`)
  } catch {
    return
  }

  if (object.primaryImage === undefined) return

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

  store.dispatch({
    type: 'setMetArtObjects',
    artObjects
  })

  return artObject
}

export const metmuseum = {
  randomArtObject
}
