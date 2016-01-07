import '../../services/open-weather'

import React from 'react'
import { on } from '../../services/mediator'
import { ls } from '../../services/storage'

export default class WeatherWidget extends React.Component {
  constructor (props) {
    super(props)

    on('update.Widgets.Weather', changes =>
      this.setState(changes)
    )

    const units = ls.get('Codsworth.Widgets.Weather.units')

    this.state = {
      temp: ls.get('Codsworth.Widgets.Weather.current.temp'),
      forecast: ls.getJSON('Codsworth.Widgets.Weather.forecast'),
      units: units === 'imperial' ? '\u00B0 F' : '\u00B0 C'
    }
  }

  render () {
    return (
      <div className='widget-weather'>
        <div className='widget-weather__now'>
          <span className='widget-weather__temp'>{ this.state.temp }</span>
          <span className='widget-weather__units'>{ this.state.units }</span>
        </div>
        <div className='widget-weather__forecast'>
          { this.state.forecast.map((weather, i) =>
            <span key={ i } className='widget-weather__forecast-date'>
              <div className='widget-weather__forecast-temp'>
                { `${weather.tempMin}\u00B0 ${weather.tempMax}\u00B0` }
              </div>
              <div>{ weather.day }</div>
            </span>
          ) }
        </div>
      </div>
    )
  }
}
