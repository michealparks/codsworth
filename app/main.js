import { openDB, putDB, clearObjectStore, getDB } from './db'

const background = document.getElementById('background')

async function main () {
  navigator.storage.persist()

  const db = await openDB('codsworth', 1, function (db) {
    if (!db.objectStoreNames.contains('images')) {
      db.createObjectStore('images', {
        keyPath: 'id',
        autoIncrement: true
      })
    }
  })

  window.flush = function () {
    clearObjectStore(db, 'images')
  }

  const storedID = localStorage.getItem('storedID')

  if (storedID) {
    const storedResult = await getDB(db, 'images', parseInt(storedID, 10))

    if (storedResult) {
      render(storedResult)
      return
    }
  }

  const gallery = await fetchGallery()
  const artObject = await fetchArtObject(gallery)

  render(artObject)

  const id = await putDB(db, 'images', artObject)

  localStorage.setItem('storedID', id)

  console.log(id)
}

async function fetchGallery () {
  const page = await window.fetch('https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=Wikipedia:Featured_pictures/Artwork/Paintings&format=json&origin=*')
  const json = await page.json()

  const doc = new DOMParser().parseFromString(json.parse.text['*'], 'text/html')

  return Array.from(doc.querySelectorAll('.gallerybox'))
}

async function fetchArtObject (gallery) {
  const [artObject] = gallery.splice(Math.floor(Math.random() * gallery.length), 1)
  const img = artObject.querySelector('img') || { src: '' }
  const [titleEl = {}, authorEl = {}] = artObject.querySelectorAll('.gallerytext a')

  const arr = img.src.split('/').slice(0, -1)
  const src = arr.concat(`2500px-${arr[arr.length - 1]}`).join('/')
  const title = titleEl.textContent || ''
  const titleLink = titleEl.href || ''
  const author = authorEl.textContent || ''
  const authorLink = authorEl.href || ''

  try {
    const url = src.split('//upload.wikimedia.org').pop()
    const res = await window.fetch(`https://upload.wikimedia.org${url}`)
    const blob = await res.blob()
    return { src, blob, title, author, titleLink, authorLink }
  } catch (err) {
    console.error(err)
  }
}

function render (result) {
  const url = URL.createObjectURL(result.blob)
  background.style.backgroundImage = `url('${url}')`

  const titleEl = document.getElementById('title')
  titleEl.textContent = result.title
  titleEl.href = `https://wikipedia.org/wiki${result.titleLink.split('/wiki').pop()}`

  const authorEl = document.getElementById('author')
  authorEl.textContent = result.author
  authorEl.href = `https://wikipedia.org/wiki${result.authorLink.split('/wiki').pop()}`
}

main()
