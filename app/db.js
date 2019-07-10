let db

export async function openDB () {
  const request = window.indexedDB.open('galeri', 3)

  request.onupgradeneeded = function (e) {
    const db = e.target.result

    if (!db.objectStoreNames.contains('images')) {
      db.createObjectStore('images', {
        keyPath: 'id',
        autoIncrement: true
      })
    }

    if (!db.objectStoreNames.contains('artObjects')) {
      db.createObjectStore('artObjects', {
        keyPath: 'id',
        autoIncrement: true
      })
    }
  }

  db = await promise(request)

  return db
}

export async function putDB (name, data) {
  return promise(db
    .transaction(name, 'readwrite')
    .objectStore(name)
    .put({ ...data, created: new Date().getTime() }))
}

export async function getDB (name, key) {
  return promise(db
    .transaction(name)
    .objectStore(name)
    .get(key))
}

export async function getAllDB (name) {
  return promise(db
    .transaction(name)
    .objectStore(name)
    .getAll())
}

export async function clearDB (name) {
  return promise(db
    .transaction(name, 'readwrite')
    .objectStore(name)
    .clear())
}

function promise (request) {
  return new Promise(function (resolve, reject) {
    function onEvent ({ target }) {
      resolve(target.result)
    }

    request.onsuccess = onEvent
    request.onerror = onEvent
    request.onabort = onEvent
  })
}
