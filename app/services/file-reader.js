const reader = new window.FileReader()

export default function readAsDataURL (file) {
  return new Promise((resolve, reject) => {
    reader.addEventListener('error', () => reject(reader.result))
    reader.addEventListener('load', () => resolve(reader.result))
    reader.readAsDataURL(file)
  })
}
