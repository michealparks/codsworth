import { fetchJSON } from './util'
import { db } from './db'
import { artObjectsStore } from './store'

const endpoint = 'https://www.rijksmuseum.nl/api/en/collection?format=json&ps=30&imgonly=True&type=painting&key=1KfM6MpD'

async function randomArtObject () {
  const artObjects = await getArtObjects()

  if (!artObjects) return

  return removeRandomArtObject(artObjects)
}

async function getArtObjects () {
  const res = await db.get('artObjects', 'rijks')

  if (res && res.artObjects.length > 0) {
    return res.artObjects
  } else {
    const page = parseInt(localStorage.getItem('rijks_page') || 1, 10)
    const [err, json] = await fetchJSON(`${endpoint}&p=${page}`)

    if (err) return

    const artObjects = []

    for (const artObject of json.artObjects) {
      if (!artObject.webImage) continue

      artObjects.push({
        src: artObject.webImage.url,
        title: artObject.title,
        author: artObject.principalOrFirstMaker,
        provider: 'Rijksmuseum',
        titleLink: artObject.links.web,
        providerLink: 'https://www.rijksmuseum.nl/en',
        blob: undefined,
        timestamp: undefined
      })
    }

    artObjectsStore.dispatch({
      type: 'ADD_ARTOBJECTS',
      artObjects: { key: 'rijks', artObjects }
    })

    localStorage.setItem('rijks_page', page + 1)

    return artObjects
  }
}

function removeRandomArtObject (artObjects) {
  const [object] = (artObjects.splice(Math.floor(Math.random() * artObjects.length), 1) || [])

  artObjectsStore.dispatch({
    type: 'ADD_ARTOBJECTS',
    artObjects: { key: 'rijks', artObjects }
  })

  return object
}

export const rijks = {
  randomArtObject
}
