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

  if (!response) return

  if (response.status >= 200 && response.status < 300) {
    return response
  }
}
