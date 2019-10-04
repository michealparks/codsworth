export const db = {
  ref: undefined,

  async open (name, version, onupgradeneeded) {
    const request = window.indexedDB.open(name, version)
    request.onupgradeneeded = onupgradeneeded
    db.ref = await db.promise(request)
  },

  get (name, key) {
    return db.promise(db.ref
      .transaction(name)
      .objectStore(name)
      .get(key))
  },

  put (name, data) {
    return db.promise(db.ref
      .transaction(name, 'readwrite')
      .objectStore(name)
      .put({ ...data, created: new Date().getTime() }))
  },

  getAll (name) {
    return db.promise(db.ref
      .transaction(name)
      .objectStore(name)
      .getAll())
  },

  remove (name, key) {
    return db.promise(db.ref
      .transaction(name, 'readwrite')
      .objectStore(name)
      .delete(key))
  },

  destroy (name) {
    return db.promise(db.ref
      .transaction(name, 'readwrite')
      .objectStore(name)
      .clear())
  },

  promise (request) {
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
}
