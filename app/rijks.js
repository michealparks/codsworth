import { getDB } from './db'
import { artObjectsStore } from './store'

async function randomArtObject () {
  const artObjects = await getArtObjects()

  if (!artObjects) return

  return removeRandomArtObject(artObjects)
}

async function getArtObjects () {
  const id = localStorage.getItem('rijks_objects_id')

  if (id) {
    const res = await getDB('artObjects', 'rijks')
    const { artObjects } = res || {}

    if (artObjects && artObjects.length > 0) {
      return artObjects
    } else {
      localStorage.removeItem('rijks_objects_id')
      return getArtObjects()
    }
  } else {
    const page = parseInt(localStorage.getItem('rijks_page') || 1, 10)
    const artObjects = fetchObjects(page)

    if (!artObjects) return

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
    artObjects
  })

  return object
}

async function fetchObjects (page) {
  try {
    const res = await window.fetch(`https://www.rijksmuseum.nl/api/en/collection?format=json&ps=30&p=${page}&imgonly=True&type=painting&key=1KfM6MpD`)
    const json = await res.json()
    return json.artObjects.filter(function (artObject) {
      return artObject.webImage !== null && artObject.webImage !== undefined
    }).map(function (artObject) {
      return {
        src: artObject.webImage.url,
        title: artObject.title.length > 60
          ? `${artObject.title.slice(0, 60)}...`
          : artObject.title,
        author: artObject.principalOrFirstMaker,
        provider: 'Rijksmuseum',
        titleLink: artObject.links.web,
        providerLink: 'https://www.rijksmuseum.nl/en',
        blob: undefined,
        timestamp: undefined
      }
    })
  } catch (err) {
    console.error(err)
  }
}

export const rijks = {
  randomArtObject
}
