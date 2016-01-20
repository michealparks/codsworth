import localforage from 'localforage'
import { installEventsTo } from './mediator'

localforage.get = localforage.getItem
localforage.set = localforage.setItem
localforage.delete = localforage.removeItem

localforage.config({
  driver: [localforage.LOCALSTORAGE, localforage.INDEXEDDB],
  name: 'Codsworth'
})

installEventsTo(localforage)

window.localforage = localforage
