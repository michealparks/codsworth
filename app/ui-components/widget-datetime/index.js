import React from 'react'
import { expandDay, expandMonth } from '../../services/time'

export default class DateTimeWidget extends React.Component {
  constructor (props) {
    super(props)
    this.state = this.getDateTime()
  }

  componentDidMount () {
    var tick = () => {
      this.setState(this.getDateTime())
      this.tickId = window.setTimeout(tick, 50)
    }

    this.tickId = window.setTimeout(tick, 0)
  }

  componentWillUnmount () {
    window.clearTimeout(this.tickId)
  }

  getDateTime () {
    const d = new Date().toString().split(' ')

    return {
      time: d[4].replace(/:/g, '.'),
      date: `${expandDay(d[0])}, ${expandMonth(d[1])} ${d[2]}, ${d[3]}`
    }
  }

  render () {
    return (
      <div className='widget-datetime'>
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
