import { fetchJSON } from './util'
import { store } from './store'

async function randomArtObject () {
  const artObjects = await getArtObjects()

  if (!artObjects) return

  return removeRandomArtObject(artObjects)
}

async function getArtObjects () {
  if (store.state.wikipediaArtObjects.length > 0) {
    return store.state.wikipediaArtObjects
  } else {
    const page = 'Wikipedia:Featured_pictures/Artwork/Paintings'
    const url = `https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=${page}&format=json&origin=*`
    const [err, json] = await fetchJSON(url)

    if (err) return

    const artObjects = parsePage(json.parse.text['*'])

    store.dispatch({
      type: 'setWikipediaArtObjects',
      artObjects
    })

    return artObjects
  }
}

function parsePage (str) {
  const doc = new DOMParser().parseFromString(str, 'text/html')
  const galleryboxes = doc.querySelectorAll('.gallerybox')
  const artObjects = []

  for (const gallerybox of galleryboxes) {
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

    artObjects.push({
      src: `https://upload.wikimedia.org${src.split('//upload.wikimedia.org').pop()}`,
      title,
      author,
      titleLink: titleLink ? `https://wikipedia.org/wiki${titleLink.split('/wiki').pop()}` : '',
      authorLink: authorLink ? `https://wikipedia.org/wiki${authorLink.split('/wiki').pop()}` : '',
      provider: 'Wikipedia',
      providerLink: 'https://wikipedia.org',
      blob: undefined,
      timestamp: undefined
    })
  }

  return artObjects
}

function removeRandomArtObject (artObjects) {
  const [object] = (artObjects.splice(Math.floor(Math.random() * artObjects.length), 1) || [])

  store.dispatch({
    type: 'setWikipediaArtObjects',
    artObjects
  })

  return object
}

export const wikipedia = {
  randomArtObject
}
