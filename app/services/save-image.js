import localForage from 'localForage'

function onLoad (done) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = this.width
  canvas.height = this.height
  ctx.drawImage(this, 0, 0, this.width, this.height)

  const imgAsDataURL = canvas
    .toDataURL(`image/${this.src.substr(this.src.lastIndexOf('.') + 1)}`)

  try {
    localForage.set(`Websites.icons.${this.alt}`, imgAsDataURL)
      .then(done)
  } catch (err) {
    done()
    throw err
  }
}

export default config => {
  const {
    title,
    src,
    img = document.createElement('img'),
    done = () => {}
  } = config

  img.crossOrigin = 'Anonymous'
  img.src = src || img.src
  img.alt = title

  if (img.complete) onLoad.call(img, done)
  else img.onload = onLoad.bind(img, done)
}
