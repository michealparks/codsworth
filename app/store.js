import { createStore } from './redux'
import { db } from './db'

export const imageStore = createStore(function (state, action) {
  switch (action.type) {
    case 'ADD_ARTOBJECT':
      return action.artObject
    default:
      return state
  }
})

export const artObjectsStore = createStore(function (state, action) {
  switch (action.type) {
    case 'ADD_ARTOBJECTS':
      return action.artObjects
    default:
      return state
  }
})

imageStore.subscribe(async function (artObject) {
  db.put('images', artObject)
})

artObjectsStore.subscribe(async function (data) {
  db.put('artObjects', data)
})
