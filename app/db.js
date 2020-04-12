let client

const promise = (req) => {
  return new Promise((resolve) => {
    const onEvent = ({ target }) => {
      resolve(target.result)
      req.removeEventListener('success', onEvent)
      req.removeEventListener('error', onEvent)
      req.removeEventListener('abort', onEvent)
    }

    req.addEventListener('success', onEvent)
    req.addEventListener('error', onEvent)
    req.addEventListener('abort', onEvent)
  })
}

const open = async (name, version, onupgradeneeded) => {
  const request = window.indexedDB.open(name, version)
  request.onupgradeneeded = onupgradeneeded
  client = await promise(request)
}

const get = (name, key) => {
  return promise(client
    .transaction(name)
    .objectStore(name)
    .get(key))
}

const put = (name, data) => {
  return promise(client
    .transaction(name, 'readwrite')
    .objectStore(name)
    .put({ ...data, created: Date.now() }))
}

const getAll = (name) => {
  return promise(client
    .transaction(name)
    .objectStore(name)
    .getAll())
}

const remove = (name, key) => {
  return promise(client
    .transaction(name, 'readwrite')
    .objectStore(name)
    .delete(key))
}

const destroy = (name) => {
  return promise(client
    .transaction(name, 'readwrite')
    .objectStore(name)
    .clear())
}

export const db = {
  open,
  get,
  put,
  getAll,
  remove,
  destroy
}
