let isLoaded = 'google' in window
let loadedCallbacks = []

console.log(`${Date.now()}: ${ isLoaded ? 'API loaded (already)' : 'Loading API'}`)

window.onGoogleApiLoad = function onGoogleApiLoad () {
  console.log(`${Date.now()}: API loaded (cb)`)
  isLoaded = true
  loadedCallbacks.forEach(fn => fn())
  loadedCallbacks = undefined
}

function pushLoadedCallback (callback) {
  if (isLoaded) callback()
  else loadedCallbacks.push(callback)
}

export function loadGoogleAPI (name, version) {
  return new Promise((resolve, reject) => {
    pushLoadedCallback(() =>
      window.google.load(name, version, { callback: () => resolve() })
    )
  })
}
