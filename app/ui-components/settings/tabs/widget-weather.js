import React from 'react'
import SettingsTab from './tab'
import localforage from 'localforage'

export default class WeatherWidgetTab extends React.Component {
  constructor (props) {
    super(props)

    localforage.get('Weather.user')
      .then(data => this.setState(data))

    localforage.get('Weather.units')
      .then(data => console.log(data))

    this.state = {
      location: '',
      units: ''
    }
  }

  updateUnits (e) {
    
  }

  updateCity (e) {
    const location = this.refs.cityInput.value
    localforage.set('Weather.user', { location })
    localforage.emit('Weather.user', { location })
    this.setState({ location })
  }

  render () {
    return (
      <SettingsTab title='Weather' widget='WeatherWidget'>
        <div className='settings-tab__content'>
          <label>
            <span>Units</span>
            <select
              className='settings-tab__option'
              onChange={ this.updateUnits.bind(this) }
            >
              <option>Celsius</option>
              <option>Fahrenheit'</option>
              <option>Kelvin</option>
            </select>
          </label>

          <label className='settings-tab__option'>
            <span>City</span>
            <input
              ref='cityInput'
              name='city'
              placeholder={ this.state.location }
            />
            <button
              onTouchEnd={ this.hasTouch && this.updateCity.bind(this) }
              onMouseUp={ !this.hasTouch && this.updateCity.bind(this) }
            >
              Update
            </button>
          </label>
        </div>
      </SettingsTab>
    )
  }
}
