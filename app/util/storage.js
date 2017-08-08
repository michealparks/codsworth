module.exports = storage

const stringify = JSON.stringify.bind(JSON)
const parse = JSON.parse.bind(JSON)
const get = localStorage.getItem.bind(localStorage)
const set = localStorage.setItem.bind(localStorage)

const noStore = !(() => {
  try {
    const x = '__storage_test__'
    localStorage.setItem(x, x)
    localStorage.removeItem(x)
    return true
  } catch (e) {
    return false
  }
})()

function storage (key, val) {
  if (noStore) return undefined

  return val !== undefined
    ? set(key, stringify(val))
    : parse(get(key))
}
