import { db } from './db'
import { fetch } from './util'
import { wikipedia } from './wikipedia'
import { rijks } from './rijks'
import { imageStore } from './store'
import { blacklist } from './blacklist'

const twoHours = 1000 * 60 * 60 * 2
const thirtySeconds = 1000 * 10

export async function setArtObject () {
  let current, next

  current = await db.get('images', 'current')

  const expired = (current && current.timestamp < Date.now() - twoHours)

  if (!current || expired) {
    next = await db.get('images', 'next')

    if (next) {
      current = next
      await db.remove('images', 'next')
    } else {
      current = await getArtObject()
    }
    console.log(current)
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

function getRandom () {
  const r = Math.floor(Math.random() * 2)

  switch (r) {
    case 0: return wikipedia.randomArtObject()
    case 1: return rijks.randomArtObject()
  }
}

async function getArtObject () {
  const artObject = await getRandom()

  if (!artObject) {
    return getArtObject()
  }

  console.log(artObject.src, blacklist.includes(artObject.src))
  if (blacklist.includes(artObject.src)) {
    return getArtObject()
  }

  if (artObject.blob) {
    artObject.timestamp = Date.now()
    return artObject
  }

  const [err, blob] = await fetchImageBlob(artObject.src)

  if (err) return getArtObject()

  artObject.blob = blob
  artObject.timestamp = Date.now()

  return artObject
}

async function fetchImageBlob (src) {
  try {
    const res = await fetch(src.replace('chrome-extension://', 'https://'))

    if (!res) return [true]

    const blob = await res.blob()
    return [undefined, blob]
  } catch (err) {
    console.error(err)
    return [true]
  }
}
