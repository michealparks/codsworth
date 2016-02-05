import React from 'react'
import localforage from 'localforage'
import getWeather from '../../services/weather'

export default class WeatherWidget extends React.Component {
  constructor (props) {
    super(props)

    localforage.get('Weather').then(data => this.setState({
      units: data.units === 'imperial' ? '\u00B0 F' : '\u00B0 C'
    }))

    localforage.on('Weather.data', data => this.setState(data))
    getWeather().then(data => data && this.setState(data))

    this.state = {
      units: '',
      temp: '',
      forecast: []
    }
  }

  renderForecast () {
    return this.state.forecast.map((weather, i) =>
      <span key={ i } className='widget-weather__forecast-date'>
        <div className='widget-weather__forecast-temp'>
          { `${weather.high}\u00B0 ${weather.low}\u00B0` }
        </div>
        <div>{ weather.day }</div>
      </span>
    )
  }

  render () {
    return (
      <div className='widget-weather'>
        <div className='widget-weather__now'>
          <span className='widget-weather__temp'>{ this.state.temp }</span>
          <span className='widget-weather__units'>{ this.state.units }</span>
        </div>
        <div className='widget-weather__forecast'>
          { this.renderForecast() }
        </div>
      </div>
    )
  }
}
