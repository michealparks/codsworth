import { fetchBuffer } from '../util/fetch.js'
import fs from 'fs'
import crypto from 'crypto'
import { promisify } from 'util'
import { extname, resolve } from 'path'
import FileType from 'file-type'

const { app } = require('electron')

const writeFile = promisify(fs.writeFile)

/**
 * Fetches and image, writes it to disk, and returns a filepath
 * @param {string} url
 * @return { string } filepath
 */
const fetchImage = async (url) => {
  const [bufErr, buffer] = await fetchBuffer(url)

  if (bufErr) return bufErr

  const { ext } = await FileType.fromBuffer(buffer)
  const filename = `artwork_${crypto.createHash('md5').update(url).digest('base64')}.${ext}`
  const path = resolve(`${app.getPath('userData')}`, filename)
  const writeErr = await writeFile(path, buffer)

  return writeErr
}

export const image = {
  fetch: fetchImage
}
