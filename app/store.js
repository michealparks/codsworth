import { db } from './db'

// N.A.S.T.Y. - Not Another State Transformation Yack
const constructStore = (stateGetter, reducer) => {
  const subscribers = new Map()

  const initialize = async () => {
    store.state = await stateGetter()
  }

  const subscribe = (channel, fn) => {
    if (subscribers.has(channel) === false) {
      subscribers.set(channel, [])
    }

    subscribers.get(channel).push(fn)
  }

  const unsubscribe = (channel, fn) => {
    const fns = subscribers.get(channel)
    fns.splice(fns.indexOf(fn), 1)
  }

  const dispatch = (action) => {
    reducer(store.state, action)

    for (const fn of subscribers.get(action.type) || []) {
      fn(store.state)
    }
  }

  const store = {
    state: {},
    initialize,
    subscribe,
    unsubscribe,
    dispatch
  }

  return store
}

export const store = constructStore(async () => {
  await db.open('galeri', 2, (e) => {
    const { result } = e.target

    if (result.objectStoreNames.contains('artObject') === false) {
      result.createObjectStore('artObject', {
        keyPath: 'id',
        autoIncrement: true
      })
    }

    if (result.objectStoreNames.contains('artObjects') === false) {
      result.createObjectStore('artObjects', {
        keyPath: 'id',
        autoIncrement: true
      })
    }
  })

  const currentArtObjects = await db.getAll('artObject')
  const artObjects = await db.getAll('artObjects')
  const wikipediaArtObjects = artObjects.find(({ id }) => id === 'wikipedia')
  const rijksArtObjects = artObjects.find(({ id }) => id === 'rijks')

  return Object.seal({
    currentArtObject: currentArtObjects.find(({ id }) => id === 'current'),
    nextArtObject: currentArtObjects.find(({ id }) => id === 'next'),
    wikipediaArtObjects: wikipediaArtObjects ? wikipediaArtObjects.artObjects : [],
    rijksArtObjects: rijksArtObjects ? rijksArtObjects.artObjects : []
  })
}, (state, action) => {
  switch (action.type) {
    case 'setCurrentArtObject':
      db.put('artObject', { id: 'current', ...action.artObject })
      state.currentArtObject = action.artObject
      break
    case 'setNextArtObject':
      db.put('artObject', { id: 'next', ...action.artObject })
      state.nextArtObject = action.artObject
      break
    case 'setWikipediaArtObjects':
      db.put('artObjects', { id: 'wikipedia', artObjects: action.artObjects })
      state.wikipediaArtObjects = action.artObjects
      break
    case 'setRijksArtObjects':
      db.put('artObjects', { id: 'rijks', artObjects: action.artObjects })
      state.rijksArtObjects = action.artObjects
      break
  }
})
