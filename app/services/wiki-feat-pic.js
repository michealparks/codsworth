import localforage from 'localforage'

const api = 'http://104.131.164.142:3000'
const oneDay = 1000 * 60 * 60 * 24

export default function getFeaturedImg () {
  return localforage.get('Backgrounds.FeatPic').then(data => {
    if (!data || Date.now() - data.time > oneDay) return getFromAPI()
    return data
  })
}

function getFromAPI () {
  return window.fetch(`${api}/featured-pic`)
    .then(response => response.json())
    .then(response => {
      localforage.set('Backgrounds.FeatPic', response)
      return response
    })
}
