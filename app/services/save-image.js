import localforage from 'localforage'
import readAsDataURL from './file-reader'

export default function saveImage (title, src) {
  return window.fetch(src)
    .then(response => response.blob())
    .then(blob => readAsDataURL(blob))
    .then(dataURL => localforage.set(title, dataURL, true))
}
