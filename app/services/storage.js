
let hasLS = true
let hasSS = true

try {
  window.localStorage.setItem('localStorage_test', '_')
  window.localStorage.removeItem('localStorage_test', '_')
} catch (e) {
  hasLS = false
}

try {
  window.sessionStorage.setItem('sessionStorage_test', '_')
  window.sessionStorage.removeItem('sessionStorage_test', '_')
} catch (e) {
  hasSS = false
}

class StorageTemplate {
  constructor (hasStorage, storageSource) {
    this.hasStorage = hasStorage
    this.storageSource = storageSource
  }

  get (key) {
    if (!this.hasStorage) return
    return this.storageSource.getItem(key)
  }

  set (key, val) {
    if (!this.hasStorage) return
    try {
      return this.storageSource.setItem(key, val)
    } catch (e) { }
  }

  delete (key) {
    if (!this.hasStorage) return
    return this.storageSource.removeItem(key)
  }

  getJSON (key) {
    if (!this.hasStorage) return
    let val = this.get(key)
    return val ? JSON.parse(val) : undefined
  }

  setJSON (key, val) {
    if (!this.hasStorage) return
    return this.set(key, JSON.stringify(val))
  }
}

let ls = new StorageTemplate(hasLS, window.localStorage)
let ss = new StorageTemplate(hasSS, window.sessionStorage)

export { ss, ls }
