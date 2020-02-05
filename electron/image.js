import fetch from 'node-fetch'
import fs from 'fs'
import { promisify } from 'util'
import { extname } from 'path'
import FileType from 'file-type'

const writeFile = promisify(fs.writeFile)

/**
 * Fetches and image, writes it to disk, and returns a filepath
 * @param {string} url
 * @return { string } filepath
 */
const fetchImage = async (url) => {
  const response = await fetch(url)

  if (response.ok === false) return ''

  const filename = crypto.createHash('md5').update(url).digest()
  const buffer = await response.buffer()
  const ext = await FileType.fromBuffer(buffer)
  console.log(ext)
  // const result = await writeFile(`./${url}`)

}

export const image = {
  fetch: fetchImage
}