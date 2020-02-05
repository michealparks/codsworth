const { promisify } = require('util')
const path = require('path')
const childProcess = require('child_process')
const execFile = promisify(childProcess.execFile)

// Binary source → https://github.com/sindresorhus/win-wallpaper
export const constructWallpaper = () => {
  const binary = path.join(__dirname, 'win-wallpaper.exe')

  const get = async () => {
    const { stdout } = await execFile(binary)
    return stdout.trim()
  }

  const set = async (imagePath) => {
    
    return execFile(binary, [path.resolve(imagePath)])
  }

  return {
    get,
    set
  }
}
