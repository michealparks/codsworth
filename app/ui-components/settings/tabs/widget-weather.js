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

  render () {
    return (
      <SettingsTab title='Weather' widget='WeatherWidget'>
        <div className='settings-tab__content'>
          <label>
            <span>Units</span>
            <select>
              <option value='Celsius' />
              <option value='Fahrenheit' />
              <option value='Kelvin' />
            </select>
          </label>

          <label>
            <span>City</span>
            <input placeholder={ this.state.location } />
          </label>
        </div>
      </SettingsTab>
    )
  }
}
