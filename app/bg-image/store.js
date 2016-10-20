let db, didInit, _next

const req = window.indexedDB.open('codsworth', 1)

req.onsuccess = function (event) {
  db = req.result

  db.onerror = function (event) {
    // TODO
  }

  didInit = true

  if (_next) getImageBlob(_next)
}

req.onupgradeneeded = function (event) {
  const objectStore = event.target.result.createObjectStore('images')
  objectStore.createIndex('image', 'image', { unique: false })
  event.target.transaction.oncomplete = (event) => {}
}

function setImageBlob (blob) {
  db.transaction(['images'], 'readwrite')
    .objectStore('images')
    .put(blob, 'image')
}

function getImageBlob (next) {
  if (!didInit) { _next = next; return }

  db.transaction(['images'], 'readwrite')
    .objectStore('images')
    .get('image')
    .onsuccess = (event) => next(event.target.result)
}

module.exports = { setImageBlob, getImageBlob }
