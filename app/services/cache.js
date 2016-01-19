
const cacheSource = 'applicationCache' in window
  ? window.applicationCache
  : undefined

if (cacheSource) init()

function init () {
  cacheSource.addEventListener('updateready', onUpdateReady)
  if (cacheSource.status === cacheSource.UPDATEREADY) {
    onUpdateReady()
  }
}

function onUpdateReady () {

}
