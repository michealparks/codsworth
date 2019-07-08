import { getDB } from './db'
import { artObjectsStore } from './store'

async function randomArtObject () {
  const artObjects = await getArtObjects()

  if (!artObjects) return

  return removeRandomArtObject(artObjects)
}

async function getArtObjects () {
  const artObjectsId = localStorage.getItem('artObjectsId')

  if (artObjectsId) {
    const res = await getDB('artObjects', parseInt(artObjectsId, 10))
    const { artObjects } = res

    if (artObjects && artObjects.length > 0) {
      return artObjects
    } else {
      localStorage.removeItem('artObjectsId')
      return getArtObjects()
    }
  } else {
    const pageStr = await fetchPage('Wikipedia:Featured_pictures/Artwork/Paintings')

    if (!pageStr) return

    const artObjects = parsePage(pageStr)

    artObjectsStore.dispatch({
      type: 'ADD_ARTOBJECTS',
      artObjects
    })

    return artObjects
  }
}

function parsePage (pageStr) {
  const doc = new DOMParser().parseFromString(pageStr, 'text/html')
  return Array.from(doc.querySelectorAll('.gallerybox')).map(function (artObject) {
    const img = artObject.querySelector('img') || { src: '' }
    const links = artObject.querySelectorAll('.gallerytext a')
    const boldEl = artObject.querySelector('.gallerytext b')
    const titleEl = boldEl.children[0] ? boldEl.children[0] : boldEl
    const authorEl = links.length > 1 ? links[1] : links[0]
    const arr = img.src.split('/').slice(0, -1)
    const src = arr.concat(`2500px-${arr[arr.length - 1]}`).join('/')
    const title = titleEl.innerText || ''
    const titleLink = titleEl.href
    const author = authorEl.innerText || ''
    const authorLink = authorEl.href

    return {
      src: `https://upload.wikimedia.org${src.split('//upload.wikimedia.org').pop()}`,
      title,
      author,
      titleLink: titleLink ? `https://wikipedia.org/wiki${titleLink.split('/wiki').pop()}` : '',
      authorLink: authorLink ? `https://wikipedia.org/wiki${authorLink.split('/wiki').pop()}` : '',
      provider: 'Wikipedia',
      providerLink: 'https://wikipedia.org',
      blob: undefined,
      timestamp: undefined
    }
  })
}

function removeRandomArtObject (artObjects) {
  const [object] = (artObjects.splice(Math.floor(Math.random() * artObjects.length), 1) || [])

  artObjectsStore.dispatch({
    type: 'ADD_ARTOBJECTS',
    artObjects
  })

  return object
}

async function fetchPage (page) {
  try {
    const response = await window.fetch(`https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=${page}&format=json&origin=*`)
    const json = await response.json()
    return json.parse.text['*']
  } catch (err) {
    console.error(err)
  }
}

export const wikipedia = {
  randomArtObject
}
