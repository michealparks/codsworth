const { get, set } = require('../util/storage')
const { expandDay, numMonth, expandMonth } = require('./conversions')
const time = document.getElementById('time')
const date = document.getElementById('date')

let timeFormat = get('settings:time-format') || '24hr'
let dateFormat = get('settings:date-format') || 'words'
let t, d, s, suffix

tick()

function tick (once) {
  d = new Date().toString().split(' ')

  if (timeFormat === '24hr') {
    time.textContent = d[4].split(':').slice(0, -1).join('.')
  } else {
    t = d[4].split(':')
    s = (+t[0] < 12 ? 'AM' : 'PM')
    t[0] = +t[0] % 12 || 12
    time.textContent = t.slice(0, -1).join('.')

    if (s !== suffix) {
      time.classList.toggle('am', s === 'AM')
      time.classList.toggle('pm', s === 'PM')
      suffix = s
    }
  }

  if (dateFormat === 'numbers') {
    date.textContent = `${d[2]} / ${numMonth(d[1])} / ${d[3].slice(2)}`
  } else {
    date.textContent = `${expandDay(d[0])}, ${expandMonth(d[1])} ${d[2]}, ${d[3]}`
  }

  return once ? null : setTimeout(tick, 1000)
}

time.onclick = () => {
  timeFormat = (timeFormat === '24hr') ? '12hr' : '24hr'
  suffix = null

  if (timeFormat === '24hr') time.classList.remove('am', 'pm')

  tick(true)
  return set('settings:time-format', timeFormat)
}

date.onclick = () => {
  dateFormat = (dateFormat === 'words') ? 'numbers' : 'words'

  tick(true)
  return set('settings:date-format', dateFormat)
}
