module.exports = {expandDay, numMonth, expandMonth}

function expandDay (d) {
  switch (d) {
    case 'Mon': return 'Monday'
    case 'Tue': return 'Tuesday'
    case 'Wed': return 'Wednesday'
    case 'Thu': return 'Thursday'
    case 'Fri': return 'Friday'
    case 'Sat': return 'Saturday'
    case 'Sun': return 'Sunday'
  }
}

function numMonth (m) {
  switch (m) {
    case 'Jan': return 1
    case 'Feb': return 2
    case 'Mar': return 3
    case 'Apr': return 4
    case 'May': return 5
    case 'Jun': return 6
    case 'Jul': return 7
    case 'Aug': return 8
    case 'Sep': return 9
    case 'Oct': return 10
    case 'Nov': return 11
    case 'Dec': return 12
  }
}

function expandMonth (m) {
  switch (m) {
    case 'Jan': return 'January'
    case 'Feb': return 'February'
    case 'Mar': return 'March'
    case 'Apr': return 'April'
    case 'May': return 'May'
    case 'Jun': return 'June'
    case 'Jul': return 'July'
    case 'Aug': return 'August'
    case 'Sep': return 'September'
    case 'Oct': return 'October'
    case 'Nov': return 'November'
    case 'Dec': return 'December'
  }
}
