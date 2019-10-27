import { db } from './db'
import { fetchBlob } from './util'
import { wikipedia } from './wikipedia'
import { rijks } from './rijks'
import { imageStore } from './store'
import { blacklist } from './blacklist'

const threeHours = 1000 * 60 * 60 * 3

export const setArtObject = async () => {
  let current, next

  current = await db.get('images', 'current')

  const expired = (current && current.timestamp < Date.now() - threeHours)

  if (!current || expired) {
    next = await db.get('images', 'next')

    if (next) {
      current = next
      await db.remove('images', 'next')
    } else {
      current = await getArtObject()
    }
  }

  imageStore.dispatch({
    type: 'ADD_ARTOBJECT',
    artObject: {
      ...current,
      id: 'current'
    }
  })

  next = await db.get('images', 'next')

  if (!next) {
    next = await getArtObject()

    imageStore.dispatch({
      type: 'ADD_ARTOBJECT',
      artObject: {
        ...next,
        id: 'next'
      }
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
