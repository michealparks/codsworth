const time = document.getElementById('time')
const date = document.getElementById('date')

let d

tick()

setTimeout(tick, 1000 - (Date.now() % 1000))

function tick () {
  d = new Date().toString().split(' ')

  time.textContent = d[4].split(':').slice(0, -1).join('.')
  date.textContent = `${expandDay(d[0])}, ${expandMonth(d[1])} ${d[2]}, ${d[3]}`

  return setTimeout(tick, 1000)
}

function expandDay (d) {
  return {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday',
    'Sun': 'Sunday'
  }[d]
}

function expandMonth (m) {
  return {
    'Jan': 'January',
    'Feb': 'February',
    'Mar': 'March',
    'Apr': 'April',
    'May': 'May',
    'Jun': 'June',
    'Jul': 'July',
    'Aug': 'August',
    'Sep': 'September',
    'Oct': 'October',
    'Nov': 'November',
    'Dec': 'December'
  }[m]
}
