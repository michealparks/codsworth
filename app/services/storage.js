import localforage from 'localforage'
import Mediator from 'micro-mediator'

localforage.get = localforage.getItem
localforage.set = function set (key, val, toEmit) {
  toEmit && localforage.emit(key, val)
  return localforage.setItem(key, val)
}
localforage.delete = localforage.removeItem

localforage.config({
  driver: [localforage.LOCALSTORAGE, localforage.INDEXEDDB],
  name: 'Codsworth'
})

Mediator.installTo(localforage)

window.localforage = localforage
