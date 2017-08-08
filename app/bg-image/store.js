module.exports = {setImageBlob, getImageBlob}

let db, didInit, didFail, callback

if (window.indexedDB !== undefined) {
  const req = window.indexedDB.open('codsworth', 1)

  req.onsuccess = (event) => {
    db = req.result

    db.onerror = (event) => {
      // TODO
    }

    didInit = true

    if (callback) getImageBlob(callback)
  }

  req.onupgradeneeded = (event) => {
    const objectStore = event.target.result.createObjectStore('images')

    objectStore.createIndex('image', 'image', { unique: false })

    event.target.transaction.oncomplete = (event) => {}
  }
} else {
  didFail = true
}

function setImageBlob (blob) {
  db.transaction(['images'], 'readwrite')
    .objectStore('images')
    .put(blob, 'image')
}

function getImageBlob (next) {
  if (didFail) {
    return next(true)
  }

  if (!didInit) {
    callback = next
    return
  }

  db.transaction(['images'], 'readwrite')
    .objectStore('images')
    .get('image')
    .onsuccess = (event) => next(null, event.target.result)
}
