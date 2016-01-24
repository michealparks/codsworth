import localforage from 'localforage'
import Mediator from 'micro-mediator'

window.Mediator = Mediator

localforage.get = localforage.getItem
localforage.set = localforage.setItem
localforage.delete = localforage.removeItem

localforage.config({
  driver: [localforage.LOCALSTORAGE, localforage.INDEXEDDB],
  name: 'Codsworth'
})

Mediator.installTo(localforage)

window.localforage = localforage
