Number.prototype.second =
Number.prototype.seconds = function () {
  return this * 1000
}

Number.prototype.minute =
Number.prototype.minutes = function () {
  return this.seconds() * 60
}

Number.prototype.hour =
Number.prototype.hours = function () {
  return this.minutes() * 60
}

Number.prototype.day =
Number.prototype.days = function () {
  return this.hours() * 24
}

export function expandDay (d) {
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

export function expandMonth (m) {
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

export function numToDay (n) {
  return [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ][n]
}
