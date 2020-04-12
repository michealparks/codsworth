const { exec } = require('child_process')

const openInBrowser = (target) => {
  let opener = ''

  switch (process.platform) {
    case 'darwin':
      opener = 'open'
      break
    case 'win32':
      opener = 'start ""'
      break
    default:
      opener = 'python -m webbrowser'
      break
  }

  return exec(`${opener} "${target.replace(/"/g, '\\"')}"`)
}

module.exports = { openInBrowser }
