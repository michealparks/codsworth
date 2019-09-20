export const db = {
  db: undefined,
  open,
  get,
  put,
  getAll,
  remove,
  destroy
}

function promise (request) {
  return new Promise(function (resolve) {
    function onEvent ({ target }) {
      resolve(target.result)
      request.removeEventListener('success', onEvent)
      request.removeEventListener('error', onEvent)
      request.removeEventListener('abort', onEvent)
    }

    request.addEventListener('success', onEvent)
    request.addEventListener('error', onEvent)
    request.addEventListener('abort', onEvent)
  })
}

async function open (name, version, onupgradeneeded) {
  const request = window.indexedDB.open(name, version)
  request.onupgradeneeded = onupgradeneeded
  this.db = await promise(request)
}

async function get (name, key) {
  return promise(this.db
    .transaction(name)
    .objectStore(name)
    .get(key))
}

async function put (name, data) {
  return promise(this.db
    .transaction(name, 'readwrite')
    .objectStore(name)
    .put({
      ...data,
      created: new Date().getTime()
    }))
}

async function getAll (name) {
  return promise(this.db
    .transaction(name)
    .objectStore(name)
    .getAll())
}

async function remove (name, key) {
  return promise(this.db
    .transaction(name, 'readwrite')
    .objectStore(name)
    .delete(key))
}

async function destroy (name) {
  return promise(this.db
    .transaction(name, 'readwrite')
    .objectStore(name)
    .clear())
}
