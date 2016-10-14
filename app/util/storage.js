/* global localStorage */
const noStore = !storageAvailable('localStorage')
const stringify = JSON.stringify.bind(JSON)
const parse = JSON.parse.bind(JSON)
const g = localStorage.getItem.bind(localStorage)
const s = localStorage.setItem.bind(localStorage)

function storageAvailable (type) {
  try {
    const storage = window[type]
    const x = '__storage_test__'
    storage.setItem(x, x)
    storage.removeItem(x)
    return true
  } catch (e) { return false }
}

function get (key) {
  console.log(noStore)
  return noStore ? null : parse(g(key))
}

function set (key, val) {
  return noStore ? null : s(key, stringify(val))
}

module.exports = { get, set }
