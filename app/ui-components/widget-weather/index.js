import React from 'react'
import localforage from 'localforage'
import classnames from 'classnames'
import getWeather from '../../services/weather'
import { execIfUnmoved } from './../services/touch'
import icons from './icons'


export default class WeatherWidget extends React.Component {
  constructor (props) {
    super(props)

    localforage.get('Weather').then(data => this.setState({
      units: data.units,
      unitString: data.units === 'imperial' ? '\u00B0 F' : '\u00B0 C'
    }))

    localforage.on('Weather.data', data => this.setState(data))
    getWeather()
      .then(data => data && this.setState(data))
      .catch(error => this.setState({ error }))

    this.state = {
      units: '',
      unitString: '',
      temp: '',
      code: '',
      forecast: [],
      active: 0,
      error: ''
    }
  }

  onForecastSelect (e) {
    this.setState({
      active: Number(e.currentTarget.getAttribute('data-i'))
    })
  }

  getTemp (temp) {
    if (this.state.units === 'metric') return temp
    return Math.round(temp * 9 / 5 + 32)
  }

  renderForecast () {
    return this.state.forecast.map((weather, i) =>
      <span
        key={ i }
        data-i={ i }
        onTouchEnd={ this.hasTouch && execIfUnmoved(this.onForecastSelect.bind(this)) }
        onMouseUp={ !this.hasTouch && execIfUnmoved(this.onForecastSelect.bind(this)) }
        className={ classnames(
          'widget-weather__forecast-date',
          { 'widget-weather__forecast-date--active': this.state.active === i }
        ) }
      >
        <div className='widget-weather__forecast-temp'>
          { `${ this.getTemp(weather.high) }\u00B0 ${ this.getTemp(weather.low) }\u00B0` }
        </div>
        <div className='widget-weather__forecast-day'>
          { weather.day }
        </div>
      </span>
    )
  }

  renderError () {
    return this.state.error
      ? <h2>{ this.state.error }</h2>
      : ''
  }

  render () {
    return (
      <div className='widget widget-weather'>
        <div className='widget-weather__now'>
          { this.renderError() }
          <span className='widget-weather__temp'>
            { this.getTemp(this.state.temp) }
            <span className='widget-weather__units'>{ this.state.unitString }</span>
          </span>
          <span className='widget-weather__icon'>{ icons[this.state.code] }</span>
          <span className='widget-weather__description'>{ this.state.code }</span>
        </div>
        <div className='widget-weather__forecast'>
          { this.renderForecast() }
        </div>
      </div>
    )
  }
}
