import { store } from './store.js'
import { setCurrentArtObject } from './art-object.js'

const ui = document.getElementById('ui')
const refreshBtn = document.getElementById('btn-refresh')
const background = document.getElementById('background')
const titleNode = document.getElementById('title')
const authorNode = document.getElementById('author')
const providerNode = document.getElementById('provider')

const hideUI = () => {
  ui.style.display = 'none'
}

const setImage = (state) => {
  const { blob, title, titleLink, author, authorLink, provider, providerLink } = state.currentArtObject

  const img = new window.Image()
  const url = URL.createObjectURL(blob)

  img.onload = () => {
    background.classList.toggle('portrait', img.naturalWidth < img.naturalHeight)
    background.style.backgroundImage = `url('${url}')`

    titleNode.textContent = title.length > 50 ? `${title.slice(0, 50)}...` : title

    if (titleLink) {
      titleNode.href = titleLink
      titleNode.style.pointerEvents = 'auto'
    } else {
      titleNode.style.pointerEvents = 'none'
    }

    authorNode.textContent = author ? `by ${author}` : ''

    if (authorLink) {
      authorNode.href = authorLink
      authorNode.style.pointerEvents = 'auto'
    } else {
      authorNode.style.pointerEvents = 'none'
    }

    providerNode.textContent = `from ${provider}`
    providerNode.href = providerLink
  }

  img.src = url
}

const addListeners = () => {
  store.subscribe('setCurrentArtObject', setImage)

  refreshBtn.addEventListener('click', async (e) => {
    if (e.target.classList.contains('active')) return

    e.target.classList.add('active')

    await setCurrentArtObject({ replace: true })

    e.target.classList.remove('active')
  })
}

export const dom = {
  hideUI,
  addListeners
}
