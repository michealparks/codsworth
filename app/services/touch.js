let downX
let downY

window.addEventListener('touchstart', onPointerDown)
window.addEventListener('touchmove', onPointerMove)

function onPointerDown (e) {
  const { touches } = e

  if (touches) {
    downX = touches[0].clientX
    downY = touches[0].clientY
  }
}

function onPointerMove (e) {}

export function touchPointHasMoved (e) {
  const { changedTouches } = e

  if (!changedTouches) return false

  const currentX = changedTouches[0].clientX
  const currentY = changedTouches[0].clientY

  return Math.abs(downX - currentX) > 20 || Math.abs(downY - currentY) > 20
}

export function execIfUnmoved (func) {
  return e => touchPointHasMoved(e) ? false : func(e)
}
