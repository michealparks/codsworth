import { db } from './db'
import { dom } from './dom'
import { setArtObject } from './art-object'

const flush = async () => {
  localStorage.removeItem('rijks_page')

  try {
    await db.destroy('images')
  } catch (err) { console.error(err) }

  try {
    await db.destroy('artObjects')
  } catch (err) { console.error(err) }
}

const main = async () => {
  navigator.storage.persist()

  await db.open('galeri', 1, (e) => {
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
