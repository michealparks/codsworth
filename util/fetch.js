const timeout = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(reject, time)
  })
}

const fetch = async (...args) => {
  const response = await Promise.race([
    timeout(20000),
    globalThis.fetch(...args)
  ])

  if (response.ok) {
    return response
  } else {
    const text = await response.text()
    throw new Error(`${args[0]} - ${response.status} - ${text}`)
  }
}

const fetchJSON = async (...args) => {
  const response = await fetch(...args)
  return response.json()
}

const fetchBlob = async (...args) => {
  const response = await fetch(...args)
  return response.blob()
}

const fetchBuffer = async (...args) => {
  const response = await fetch(...args)
  return response.buffer()
}

const fetchArrayBuffer = async (...args) => {
  const response = await fetch(...args)
  return response.arrayBuffer()
}

module.exports = {
  fetchJSON,
  fetchBlob,
  fetchBuffer,
  fetchArrayBuffer
}
