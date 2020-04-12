const { fetchJSON } = require('./util')
const { store } = require('./store')

const endpoint = 'https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=11|21'

const randomArtObject = async () => {
  const artObjects = await getArtObjects()

  if (!artObjects) return

  return removeRandomArtObject(artObjects)
}

const getArtObjects = async () => {
  const { artObjects } = store.state

  if (store.state.artObjects.length > 0) {
    return artObjects
  } else {
    const [err, json] = await fetchJSON(endpoint)

    if (err) return

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
  const [err, object] = await fetchJSON(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)

  if (err !== undefined) return
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

module.exports = {
  metmuseum: {
    randomArtObject
  }
}
