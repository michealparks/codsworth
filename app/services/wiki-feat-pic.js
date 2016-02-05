import localforage from 'localforage'
import saveImage from './save-image'

const api = 'http://104.131.164.142:3000'

/*
 * Retrieves picture data and base64 url from client storage.
 * If no data is found or the data is older than 24hr, it
 * fetches from the API.
 */
export default function getFeatPic () {
  return localforage.get('Backgrounds.FeatPic').then(pictureData => {
    if (!pictureData || Date.now() - pictureData.time > Date.DAY) {
      return getFromAPI()
    }
    return pictureData
  })
  .catch(console.error.bind(console))
}

/*
 * Fetches picture data from API and attempts to save
 * it in client storage
 */
function getFromAPI () {
  return window.fetch(`${api}/featured-pic`)
    .then(response => response.json())
    .then(response => saveImageAndAddToData(response))
    .then(response => localforage.set('Backgrounds.FeatPic', response, true))
    .catch(console.error.bind(console))
}

/*
 * Attempts to convert picture url to base64 string
 * and put in client storage. If put succeeds, it
 * returns the picture data after replacing the url with the
 * base64 string to avoid an extra request. If put fails
 * it merely returns the picture data.
 */
function saveImageAndAddToData (response) {
  return saveImage('Backgrounds.FeatPicBase64', response.url)
    .then(base64Image => {
      response.url = base64Image
      return response
    })
    .catch(() => response)
}
