import { db } from './db'
import { imageStore } from './store'
import { setArtObject } from './art-object'

const ui = document.getElementById('ui')
const refreshBtn = document.getElementById('btn-refresh')
const background = document.getElementById('background')
const title = document.getElementById('title')
const author = document.getElementById('author')
const provider = document.getElementById('provider')

const hideUI = () => {
  ui.style.display = 'none'
}

const setImage = (artObject) => {
  if (artObject.id === 'next') return

  const img = new window.Image()
  const url = URL.createObjectURL(artObject.blob)

  img.onload = () => {
    background.classList.toggle('portrait', img.naturalWidth < img.naturalHeight)
    background.style.backgroundImage = `url('${url}')`

    title.textContent = artObject.title.length > 50
      ? `${artObject.title.slice(0, 50)}...`
      : artObject.title

    if (artObject.titleLink) {
      title.href = artObject.titleLink
      title.style.pointerEvents = 'auto'
    } else {
      title.style.pointerEvents = 'none'
    }

    author.textContent = artObject.author ? `by ${artObject.author}` : ''

    if (artObject.authorLink) {
      author.href = artObject.authorLink
      author.style.pointerEvents = 'auto'
    } else {
      author.style.pointerEvents = 'none'
    }

    provider.textContent = `from ${artObject.provider}`
    provider.href = artObject.providerLink
  }

  img.src = url

  imageStore.unsubscribe(setImage)
}

const replaceArtObject = async () => {
  imageStore.subscribe(setImage)

  await db.remove('images', 'current')
  await setArtObject()

  return true
}

const addListeners = () => {
  imageStore.subscribe(setImage)

  refreshBtn.addEventListener('click', async (e) => {
    if (e.target.classList.contains('active')) return

    e.target.classList.add('active')

    await replaceArtObject()

    e.target.classList.remove('active')
  })

  window.replaceArtObject = replaceArtObject
  window.hideUI = hideUI
}

export const dom = {
  addListeners
}
