import { fetchJSON } from '../util/fetch.js'
import { store } from './store.js'

const url = 'https://www.rijksmuseum.nl/api/en/collection?format=json&ps=30&imgonly=True&type=painting&key=1KfM6MpD'

async function randomArtObject () {
  const artObjects = await getArtObjects()

  if (artObjects === undefined) return

  return removeRandomArtObject(artObjects)
}

async function getArtObjects () {
  if (store.state.rijksArtObjects.length > 0) {
    return store.state.rijksArtObjects
  } else {
    const page = parseInt(localStorage.getItem('rijks_page') || 1, 10)

    let json
    try {
      json = await fetchJSON(`${url}&p=${page}`)
    } catch {
      return
    }

    const artObjects = []

    for (const artObject of json.artObjects) {
      if (!artObject.webImage) continue

      artObjects.push({
        src: artObject.webImage.url,
        title: (artObject.title || '').trim(),
        author: (artObject.principalOrFirstMaker || '').trim(),
        provider: 'Rijksmuseum',
        titleLink: artObject.links.web,
        providerLink: 'https://www.rijksmuseum.nl/en',
        blob: undefined,
        timestamp: undefined
      })
    }

    store.dispatch({
      type: 'setRijksArtObjects',
      artObjects
    })

    localStorage.setItem('rijks_page', page + 1)

    return artObjects
  }
}

function removeRandomArtObject (artObjects) {
  const [object] = (artObjects.splice(Math.floor(Math.random() * artObjects.length), 1) || [])

  store.dispatch({
    type: 'setRijksArtObjects',
    artObjects
  })

  return object
}

export const rijks = {
  randomArtObject
}
