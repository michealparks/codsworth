import React from 'react'
import localforage from 'localforage'
import { expandDay, expandMonth } from '../../services/time'

export default class DateTimeWidget extends React.Component {
  constructor (props) {
    super(props)

    localforage.on('DateTime', data => this.setState(data))
    localforage.get('DateTime', data => this.setState(data))

    this.state = {
      time: '',
      date: '',
      militaryTime: true,
      showSeconds: true
    }
  }

  componentDidMount () {
    var tick = () => {
      this.setState(this.getDateTime())
      this.tickId = window.setTimeout(tick, 1000)
    }

    this.tickId = window.setTimeout(
      tick,
      1000 - (Date.now() % 1000)
    )

    this.setState(this.getDateTime())
  }

  componentWillUnmount () {
    window.clearTimeout(this.tickId)
  }

  getDateTime () {
    const d = new Date().toString().split(' ')

    return {
      time: this.formatTime(d[4].split(':')),
      date: `${expandDay(d[0])}, ${expandMonth(d[1])} ${d[2]}, ${d[3]}`
    }
  }

  formatTime (time) {
    if (!this.state.showSeconds) {
      time = time.slice(0, -1)
    }

    if (this.state.militaryTime) {
      return time.join('.')
    }

    const h = +time[0]
    time[0] = h % 12 || 12
    return `${time.join('.')}${(h < 12) ? 'AM' : 'PM'}`
  }

  render () {
    return (
      <div className='widget widget-datetime'>
        <div className='widget-datetime__time'>
          { this.state.time }
        </div>
        <div className='widget-datetime__date'>
          { this.state.date }
        </div>
      </div>
    )
  }
}

DateTimeWidget.propTypes = {}
