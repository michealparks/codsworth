const reader = new window.FileReader()

export function readAsDataURL (file, done) {
  return new Promise((resolve, reject) => {
    reader.addEventListener('error', reject)
    reader.addEventListener('load', () => {
      resolve(reader.result)
      done && done(reader.result)
    })
    reader.readAsDataURL(file)
  })
}
