import React  from 'react'
import months from './month'
import days   from './day'

export default class DateTimeWidget extends React.Component {
  constructor(props) {
    super(props)
    this.state = this.getDateTime()
  }

  componentDidMount() {
    this.update()
  }

  update() {
    this.setState(this.getDateTime())
    window.setTimeout(this.update.bind(this), 10)
  }

  getDateTime() {
    const d = new Date().toString().split(' ')

    return {
      time: d[4].replace(/:/g, '.'),
      date: `${days(d[0])}, ${months(d[1])} ${d[2]}, ${d[3]}`
    }
  }

  render() {
    return (
      <div id="widget-datetime">
        <div id="widget-datetime-time">
          { this.state.time }
        </div>
        <div id="widget-datetime-date">
          { this.state.date }
        </div>
      </div>
    )
  }
}