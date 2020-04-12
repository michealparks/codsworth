export const setFullscreenMode = (callback) => {
  const endFullscreen = () => {
    window.removeEventListener('keydown', endFullscreen)
    window.removeEventListener('mousedown', endFullscreen)
    window.removeEventListener('touchstart', endFullscreen)
    callback()
  }

  window.addEventListener('keydown', endFullscreen, { passive: true })
  window.addEventListener('mousedown', endFullscreen, { passive: true })
  window.addEventListener('touchstart', endFullscreen, { passive: true })
}
