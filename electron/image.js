const { fetchBuffer } = require('../util/fetch.js')
const fs = require('fs')
const crypto = require('crypto')
const { promisify } = require('util')
const { resolve } = require('path')
const FileType = require('file-type')
const { app } = require('electron')
const mkdir = promisify(fs.mkdir)
const writeFile = promisify(fs.writeFile)

const createHash = (url) => {
  const hash = crypto.createHash('md5').update(url).digest('base64')
  console.log(hash)
  return hash.replace(/\//g, '0').replace('==', '2').replace('=', '1')
}

const write = async (url, buffer) => {
  const { ext } = await FileType.fromBuffer(buffer)
  const filename = `artwork_${createHash(url)}.${ext}`
  const appPath = app.getPath('appData')
  const path = resolve(`${appPath}`, 'Galeri', filename)

  try {
    await mkdir(resolve(appPath, 'Galeri'))
  } catch (err) {}

  await writeFile(path, buffer)

  return path
}

/**
 * Fetches and image, writes it to disk, and returns a filepath
 * @param {string} url
 * @return {string} filepath
 */
const download = async (url) => {
  return write(url, await fetchBuffer(url))
}

/**
 * Writes an image buffer and returns its filepath
 * @param {ArrayBuffer} buffer
 * @return {string} filepath
 */
const fromBuffer = (url, arrayBuffer) => {
  return write(url, Buffer.from(arrayBuffer))
}

module.exports = {
  image: {
    download,
    fromBuffer
  }
}
