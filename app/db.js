export async function openDB (name, version, upgrade) {
  const request = window.indexedDB.open(name, version)
  request.onupgradeneeded = function ({ target }) { upgrade(target.result) }
  return promise(request)
}

export async function putDB (db, name, data) {
  return promise(db
    .transaction(name, 'readwrite')
    .objectStore(name)
    .put({ ...data, created: new Date().getTime() }))
}

export async function getDB (db, name, id) {
  return promise(db
    .transaction(name)
    .objectStore(name)
    .get(id))
}

export async function getAllDB (db, name) {
  return promise(db
    .transaction(name)
    .objectStore(name)
    .getAll())
}

export async function clearObjectStore (db, name) {
  return promise(db
    .transaction(name, 'readwrite')
    .objectStore(name)
    .clear())
}

function promise (request) {
  return new Promise(function (resolve, reject) {
    request.onsuccess = function ({ target }) { resolve(target.result) }
    request.onerror = function ({ target }) { reject(target.result) }
    request.onabort = function ({ target }) { reject(target.result) }
  })
}
