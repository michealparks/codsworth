import { getDB } from './db'
import { metmuseum } from './metmuseum'
import { wikipedia } from './wikipedia'

export async function getArtObject () {
  const imageId = localStorage.getItem('imageId')

  if (imageId) {
    return getDB('images', parseInt(imageId, 10))
  }

  const artObject = await getRandom()

  if (!artObject) return getArtObject()

  const success = await populateImage(artObject)

  return success ? artObject : getArtObject()
}

function getRandom () {
  return wikipedia.randomArtObject()
  const r = Math.floor(Math.random() * 2)

  switch (r) {
    case 0: return metmuseum.randomArtObject()
    case 1: return wikipedia.randomArtObject()
  }
}

async function populateImage (artObject) {
  const blob = await fetchImageBlob(artObject.src)

  if (!blob) return false

  artObject.blob = blob
  artObject.timestamp = Date.now()

  return true
}

async function fetchImageBlob (src) {
  try {
    const res = await window.fetch(src.replace('chrome-extension://', 'https://'))
    const blob = await res.blob()
    return blob
  } catch (err) {
    console.error(err)
  }
}
