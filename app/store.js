import { createStore } from './redux'
import { putDB } from './db'

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
  const id = await putDB('images', artObject)
  localStorage.setItem('imageId', id)
})

artObjectsStore.subscribe(async function (artObjects) {
  const id = await putDB('artObjects', { artObjects })
  localStorage.setItem('artObjectsId', id)
})
