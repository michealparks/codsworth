import { imageStore } from './store'
import { getArtObject } from './art-object'

function setImage (artObject) {
  const background = document.getElementById('background')
  const img = new window.Image()
  const url = URL.createObjectURL(artObject.blob)

  img.onload = function () {
    if (img.naturalWidth < img.naturalHeight) {
      background.style.backgroundPosition = '50% 0'
    }

    background.style.backgroundImage = `url('${url}')`

    const titleEl = document.getElementById('title')
    titleEl.textContent = artObject.title

    if (artObject.titleLink) {
      titleEl.href = artObject.titleLink
      titleEl.style.pointerEvents = 'auto'
    } else {
      titleEl.style.pointerEvents = 'none'
    }

    const authorEl = document.getElementById('author')
    authorEl.textContent = artObject.authorLink ? `by ${artObject.author}` : ''

    if (artObject.authorLink) {
      authorEl.href = artObject.authorLink
      titleEl.style.pointerEvents = 'auto'
    } else {
      titleEl.style.pointerEvents = 'none'
    }

    const providerEl = document.getElementById('provider')
    providerEl.textContent = `from ${artObject.provider}`
    providerEl.href = artObject.providerLink
  }

  img.src = url

  imageStore.unsubscribe(setImage)
}

let active = false

function addListeners () {
  document.getElementById('btn-refresh')
    .addEventListener('click', async function (e) {
      const el = e.target

      if (active) return

      active = true
      el.classList.remove('active')
      el.classList.add('active')

      localStorage.removeItem('imageId')

      imageStore.subscribe(setImage)

      const artObject = await getArtObject()

      imageStore.dispatch({
        type: 'ADD_ARTOBJECT',
        artObject
      })

      el.addEventListener('animationiteration', function iterate () {
        el.classList.remove('active')
        el.removeEventListener('animationiteration', iterate)
      })

      active = false
    })

  imageStore.subscribe(setImage)
}

export const dom = {
  addListeners
}
