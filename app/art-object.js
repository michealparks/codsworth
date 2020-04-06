import { fetchBlob } from '../util/fetch.js'
import { wikipedia } from './wikipedia.js'
import { rijks } from './rijks.js'
import { store } from './store.js'
import { blacklist } from './blacklist.js'

const threeHours = 1000 * 60 * 60 * 3

const isExpired = (timestamp) => {
  return timestamp < Date.now() - threeHours
}

export const setCurrentArtObject = async (config = {}) => {
  let current = store.state.currentArtObject
  let next = store.state.nextArtObject

  if (current === undefined || isExpired(current.timestamp) || config.replace === true) {
    if (next === undefined) {
      current = await getArtObject()
    } else {
      current = next
      next = undefined
    }
  }

  store.dispatch({
    type: 'setCurrentArtObject',
    artObject: current
  })

  if (next === undefined) {
    next = await getArtObject()

    store.dispatch({
      type: 'setNextArtObject',
      artObject: next
    })
  }
}

const getRandom = () => {
  const r = Math.floor(Math.random() * 2)

  switch (r) {
    case 0: return wikipedia.randomArtObject()
    case 1: return rijks.randomArtObject()
  }
}

const getArtObject = async () => {
  const artObject = await getRandom()

  if (!artObject) {
    return getArtObject()
  }

  console.log(artObject.src, blacklist.includes(artObject.src))
  if (blacklist.includes(decodeURI(artObject.src))) {
    return getArtObject()
  }

  if (artObject.blob) {
    artObject.timestamp = Date.now()
    return artObject
  }

  const src = artObject.src.replace('chrome-extension://', 'https://')
  const [err, blob] = await fetchBlob(src)

  if (err) return getArtObject()

  artObject.blob = blob
  artObject.timestamp = Date.now()

  return artObject
}
