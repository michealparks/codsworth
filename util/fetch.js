const timeout = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => { resolve() }, time)
  })
}

export const fetch = async (...args) => {
  const response = await Promise.race([
    timeout(10000),
    globalThis.fetch(...args)
  ])

  if (response.ok) {
    return response
  } else {
    throw new Error(`request responded with status code ${response.status}`)
  }
}

export const fetchJSON = async (...args) => {
  try {
    const response = await fetch(...args)
    const json = await response.json()
    return [undefined, json]
  } catch (err) {
    return [err]
  }
}

export const fetchBlob = async (...args) => {
  try {
    const response = await fetch(...args)
    const blob = await response.blob()
    return [undefined, blob]
  } catch (err) {
    return [err]
  }
}

export const fetchBuffer = async (...args) => {
  try {
    const response = await fetch(...args)
    const buffer = await response.buffer()
    return [undefined, buffer]
  } catch (err) {
    return [err]
  }
}
