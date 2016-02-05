let isLoaded = 'google' in window
let loadedCallbacks = []

window.onGoogleApiLoad = function onGoogleApiLoad () {
  console.log(`${Date.now()}: API loaded (cb)`)
  isLoaded = true
  loadedCallbacks.forEach(fn => fn())
  loadedCallbacks = undefined
}

function pushCallback (callback) {
  if (isLoaded) callback()
  else loadedCallbacks.push(callback)
}

export function loadGoogleAPI (name, version) {
  return new Promise((resolve, reject) =>
    pushCallback(() =>
      window.google.load(name, version, { callback: resolve })
    )
  )
}
