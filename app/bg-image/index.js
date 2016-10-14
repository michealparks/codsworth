/* global URL, XMLHttpRequest, FileReader */
const { get, set } = require('../util/storage')
const { days } = require('../util/time')
const bg = [ document.getElementById('bg-0'), document.getElementById('bg-1') ]
const bgCL = [ bg[0].classList, bg[1].classList ]
const text = document.getElementById('text')
const template = document.createElement('template')
const reader = new FileReader()
reader.onload = onRead

let req, textHTML

const imageData = get('image')

if (imageData && (Date.now() - imageData.time < days(1))) {
  renderImage(imageData.url, imageData.text)
} else {
  makeRequest(
    'json',
    'https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=Main_Page&format=json&origin=*',
    onMainPageErr,
    onMainPageLoad
  )
}

function makeRequest (type, url, onerror, onload) {
  req = new XMLHttpRequest()
  req.open('GET', url, true)
  req.responseType = type
  req.onerror = onerror
  req.onload = onload
  req.send()
}

function onMainPageErr () {

}

function onMainPageLoad () {
  template.innerHTML = req.response.parse.text['*']

  const section = template.content.querySelector('#mp-lower')
  const imageURL = section.querySelector('img').getAttribute('src').split('/')
  const size = imageURL.pop().replace(/^[0-9]{3,4}px/, `2000px`)
  const url = `https:${imageURL.join('/')}/${size}`
  const description = section.querySelector('p')

  Array.prototype.slice.call(description.querySelectorAll('a'))
    .forEach(el => {
      el.setAttribute('href', `https://wikipedia.org${el.getAttribute('href')}`)
      el.setAttribute('target', '_blank')
    })

  makeRequest(
    'blob',
    url,
    onImageErr,
    onImageLoad
  )

  textHTML = description.innerHTML
}

function onImageLoad () {
  reader.readAsDataURL(req.response)
}

function onRead (e) {
  const url = e.target.result

  renderImage(url, textHTML)

  return set('image', {
    url,
    text: textHTML,
    time: Date.now()
  })
}

function onImageErr () {

}

function renderImage (url, html) {
  bg[0].style.backgroundImage = `url("${url}")`
  text.innerHTML = html
}

