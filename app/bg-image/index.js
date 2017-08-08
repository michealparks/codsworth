/* global URL, XMLHttpRequest */
const storage = require('../util/storage')
const db = require('./store')
const {days} = require('../util/time')
const bg = [document.getElementById('bg-0'), document.getElementById('bg-1')]
const bgCL = bg[1].classList
const text = document.getElementById('text')
const Img = new window.Image()
const wikiURL = 'https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=Main_Page&format=json&origin=*'
const imageData = storage('image')
const parser = new DOMParser()

let textHTML
let i = 0

db.getImageBlob((err, blob) => {
  if (err || !imageData || (Date.now() - imageData.time) >= days(1)) {
    makeImageRequest()
  }

  if (!blob || !imageData) return

  renderImage(URL.createObjectURL(blob), imageData.text)
})

function makeImageRequest () {
  setTimeout(makeImageRequest, days(1))

  makeRequest('json', wikiURL, onMainPageErr, onMainPageLoad)
}

function makeRequest (type, url, onerror, onload) {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.responseType = type
  xhr.onerror = onerror
  xhr.ontimeout = onerror
  xhr.onload = onload
  xhr.send()
}

function onMainPageErr () {
  // add 503 handling
}

function onMainPageLoad () {
  const doc = parser.parseFromString(this.response.parse.text['*'], 'text/html')
  const section = doc.querySelector('#mp-lower')
  const imageURL = section.querySelector('img').getAttribute('src').split('/')
  const size = imageURL.pop().replace(/^[0-9]{3,4}px/, '2400px')
  const url = 'https:' + imageURL.join('/') + '/' + size

  makeRequest('blob', url, onImageErr, onImageLoad)

  const description = section.querySelector('p')
  const links = description.querySelectorAll('a')

  for (let el, i = 0, l = links.length; i < l; ++i) {
    el = links[i]
    el.setAttribute('href', 'https://wikipedia.org' + el.getAttribute('href'))
    el.setAttribute('target', '_blank')
  }

  textHTML = description.innerHTML
}

function onImageLoad () {
  const imgURL = URL.createObjectURL(this.response)

  renderImage(imgURL, textHTML)

  db.setImageBlob(this.response)

  storage('image', {
    text: textHTML,
    time: Date.now()
  })
}

function onImageErr () {

}

function renderImage (url, html) {
  i = (i + 1) % 2
  bg[i].style.backgroundImage = `url("${url}")`
  text.innerHTML = html

  Img.onload = () => bgCL.toggle('bg-image--active', i === 1)
  Img.src = url
}
