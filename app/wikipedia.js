import { fetch } from './util'
import { db } from './db'
import { artObjectsStore } from './store'

async function randomArtObject () {
  const artObjects = await getArtObjects()

  if (!artObjects) return

  return removeRandomArtObject(artObjects)
}

async function getArtObjects () {
  const res = await db.get('artObjects', 'wikipedia')

  if (res && res.artObjects.length > 0) {
    return res.artObjects
  } else {
    const [err, str] = await fetchPage('Wikipedia:Featured_pictures/Artwork/Paintings')

    if (err) return

    const artObjects = parsePage(str)
    console.log(artObjects.map(function ({ src }) {
      return src
    }))

    artObjectsStore.dispatch({
      type: 'ADD_ARTOBJECTS',
      artObjects: { key: 'wikipedia', artObjects }
    })

    return artObjects
  }
}

function parsePage (str) {
  const doc = new DOMParser().parseFromString(str, 'text/html')
  const galleryboxes = Array.from(doc.querySelectorAll('.gallerybox'))

  return galleryboxes.map(function (gallerybox) {
    const img = gallerybox.querySelector('img') || { src: '' }
    const links = gallerybox.querySelectorAll('.gallerytext a')
    const boldEl = gallerybox.querySelector('.gallerytext b')
    const titleEl = boldEl.children[0] ? boldEl.children[0] : boldEl
    const authorEl = links.length > 1 ? links[1] : links[0]
    const arr = img.src.split('/').slice(0, -1)
    const src = arr.concat(`2000px-${arr[arr.length - 1]}`).join('/')
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
    artObjects: { key: 'wikipedia', artObjects }
  })

  return object
}

async function fetchPage (page) {
  try {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=${page}&format=json&origin=*`)

    if (!response) return [true]

    const json = await response.json()

    return [undefined, json.parse.text['*']]
  } catch (err) {
    console.error(err)
    return [true]
  }
}

export const wikipedia = {
  randomArtObject
}
