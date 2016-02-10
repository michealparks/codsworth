const reader = new window.FileReader()

export const readAsDataURL = readAs.bind('DataURL')
export const readAsArrayBuffer = readAs.bind('ArrayBuffer')
export const readAsText = readAs.bind('Text')

function readAs (item) {
  return new Promise((resolve, reject) => {
    addEvents(resolve, reject)
    return reader[`readAs${this}`](item)
  })
}

function addEvents (resolve, reject) {
  reader.addEventListener('error', function onError () {
    reject(reader.result)
    reader.removeEventListener('error', onError)
  })
  reader.addEventListener('load', function onLoad () {
    resolve(reader.result)
    reader.removeEventListener('load', onLoad)
  })
}
