import { getDB } from './db'
import { artObjectsStore } from './store'

async function randomArtObject () {
  const artObjects = await getArtObjects()

  if (!artObjects) return

  return removeRandomArtObject(artObjects)
}

async function getArtObjects () {
  const artObjectsId = localStorage.getItem('artObjectsId')
}

export const metmuseum = {
  randomArtObject
}
