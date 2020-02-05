const timeout = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => { resolve() }, time)
  })
}

export const fetch = async (...args) => {
  const response = await Promise.race([
    timeout(10000),
    window.fetch(...args)
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
