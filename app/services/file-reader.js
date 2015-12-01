const reader = new FileReader()

export function readAsDataURL(file, done) {
  return new Promise()
  reader.onloadend = done
  reader.readAsDataURL(file)
}