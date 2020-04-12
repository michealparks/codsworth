const { autoUpdater } = require('electron')
const { fetchJSON } = require('../util/fetch.js')
const constants = require('./consts.js')
const REGEX_ZIP_URL = /\/(v)?(\d+\.\d+\.\d+)\/.*\.zip/
const __dev__ = process.env.NODE_ENV === 'development'
const win32 = process.platform === 'win32'
const headers = { 'User-Agent': 'galeri' }

if (__dev__) {
  autoUpdater.on('error', e =>
    console.error('update error: ', e))
  autoUpdater.on('checking-for-update', e =>
    console.log('checking for update: ', e))
  autoUpdater.on('update-available', e =>
    console.log('update available: ', e))
  autoUpdater.on('update-not-available', e =>
    console.log('update not available: ', e))
}

autoUpdater.on('update-downloaded', (msg) => {
  autoUpdater.quitAndInstall()
})

const parseTag = (tag = '') => {
  return tag.slice(1).split('.').map(Number)
}

const check = async () => {
  const latestTag = await fetchJSON(constants.GITHUB_RELEASE_API, { headers })
  const tag = parseTag(latestTag.tag_name)

  if (!newVersionExists(tag)) {
    return false
  }

  const feedUrl = await getFeedURL(tag)

  autoUpdater.setFeedURL(feedUrl)
  autoUpdater.checkForUpdates()
}

check()
setInterval(check, constants.CHECK_UPDATE_INTERVAL)

const newVersionExists = (tag) => {
  const current = parseTag(constants.APP_VERSION)

  let i = 0
  for (const version of current) {
    if (tag[i] > version) {
      return true
    }
    i += 1
  }

  return false
}

const getFeedURL = async (tag) => {
  if (win32) {
    return `${constants.GITHUB_URL}/releases/download/${tag}`
  }

  const json = await fetchJSON(`${constants.GITHUB_URL_RAW}/updater.json`)
  const match = json.url.match(REGEX_ZIP_URL)

  if (!match) {
    throw new Error(`The zipUrl (${json.url}) is a invalid release URL`)
  }

  const zipVerison = match[match.length - 1]

  if (zipVerison !== tag.slice(1)) {
    throw new Error(`The feedUrl does not link to latest tag (zipUrl=${zipVerison}; latestVersion=${tag})`)
  }

  return `${constants.GITHUB_URL_RAW}/updater.json`
}
