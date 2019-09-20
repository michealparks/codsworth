import { db } from './db'
import { dom } from './dom'
import { setArtObject } from './art-object'

async function flush () {
  localStorage.removeItem('rijks_page')

  try { await db.destroy('images') } catch (err) { console.error(err) }
  try { await db.destroy('artObjects') } catch (err) { console.error(err) }
}

async function main () {
  navigator.storage.persist()

  await db.open('galeri', 1, function (e) {
    const { result } = e.target

    if (!result.objectStoreNames.contains('images')) {
      result.createObjectStore('images', {
        keyPath: 'id',
        autoIncrement: true
      })
    }

    if (!result.objectStoreNames.contains('artObjects')) {
      result.createObjectStore('artObjects', {
        keyPath: 'key',
        autoIncrement: true
      })
    }
  })

  dom.addListeners()

  await setArtObject()

  window.flush = flush
}

main()
