function timeout (time) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve()
    }, time)
  })
}

export async function fetch (...args) {
  const response = await Promise.race([
    timeout(10000),
    window.fetch(...args)
  ])

  if (!response) return

  if (response.status >= 200 && response.status < 300) {
    return response
  }
}
