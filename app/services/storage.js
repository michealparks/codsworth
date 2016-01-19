import localforage from 'localforage'

localforage.get = localforage.getItem
localforage.set = localforage.setItem
localforage.delete = localforage.removeItem

localforage.config({
  driver: [localforage.LOCALSTORAGE, localforage.INDEXEDDB],
  name: 'Codsworth'
})

window.localforage = localforage