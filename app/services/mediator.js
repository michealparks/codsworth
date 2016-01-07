let channels = new Map()
let idProvider = 0

export function emit (name, data) {
  var channel = channels.get(name)
  if (!channel) return console.error('Mediator: no such channel ' + channel)
  channel.forEach(function (fn) { fn(data) })
}

export function on (name, fn) {
  if (!channels.has(name)) channels.set(name, new Map())
  channels.get(name).set(++idProvider, fn)
  return idProvider
}

export function off (name, id) {
  var channel = channels.get(name)
  if (!channel) return console.error('Mediator: no such channel ' + channel)
  channel.delete(id)
}

export function installTo (obj) {
  obj.emit = emit
  obj.on = on
  obj.off = off
}

export default { emit, on, off, installTo }
