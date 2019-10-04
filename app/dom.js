import { db } from './db'
import { imageStore } from './store'
import { setArtObject } from './art-object'

const setImage = (artObject) => {
  if (artObject.id === 'next') return

  const background = document.getElementById('background')
  const img = new window.Image()
  const url = URL.createObjectURL(artObject.blob)

  img.onload = () => {
    background.classList.toggle('portrait', img.naturalWidth < img.naturalHeight)

    background.style.backgroundImage = `url('${url}')`

    const titleEl = document.getElementById('title')
    titleEl.textContent = artObject.title.length > 50
      ? `${artObject.title.slice(0, 50)}...`
      : artObject.title

    if (artObject.titleLink) {
      titleEl.href = artObject.titleLink
      titleEl.style.pointerEvents = 'auto'
    } else {
      titleEl.style.pointerEvents = 'none'
    }

    const authorEl = document.getElementById('author')
    authorEl.textContent = artObject.author ? `by ${artObject.author}` : ''

    if (artObject.authorLink) {
      authorEl.href = artObject.authorLink
      authorEl.style.pointerEvents = 'auto'
    } else {
      authorEl.style.pointerEvents = 'none'
    }

    const providerEl = document.getElementById('provider')
    providerEl.textContent = `from ${artObject.provider}`
    providerEl.href = artObject.providerLink
  }

  img.src = url

  imageStore.unsubscribe(setImage)
}

let active = false

const refreshBtn = document.getElementById('btn-refresh')

const addListeners = () => {
  imageStore.subscribe(setImage)

  refreshBtn.addEventListener('click', async (e) => {
    if (active) return

    active = true
    refreshBtn.classList.add('active')

    imageStore.subscribe(setImage)

    await db.remove('images', 'current')
    await setArtObject()

    refreshBtn.classList.remove('active')

    active = false
  })
}

export const dom = {
  addListeners
}
