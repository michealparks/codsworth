import React from 'react'
import SettingsTab from './tab'
import localforage from 'localforage'
import Toggle from 'react-toggle'

export default class DateTimeWidgetTab extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showSeconds: false,
      militaryTime: false
    }
  }

  onToggleChange (e) {
    const { currentTarget } = e
    const type = currentTarget.getAttribute('data-type')

    localforage.get('DateTime')
      .then(data => localforage.set('DateTime', {
        showSeconds: type === 'showSeconds' ? e.checked : data.showSeconds,
        militaryTime: type === 'militaryTime' ? e.checked : data.militaryTime
      }))
      .then(data => console.log(data))
  }

  render () {
    return (
      <SettingsTab title='Date & Time' widget='DateTimeWidget'>
        <div className='settings-tab__content'>
          <label className='settings-tab__option'>
            <span>Show Seconds</span>
            <div className='react-toggle-container'>
              <Toggle
                data-type='showSeconds'
                checked={ this.state.showSeconds }
                onChange={ this.onToggleChange.bind(this) }
              />
          </div>
          </label>
          <label className='settings-tab__option'>
            <span>24 Hour Time</span>
            <div className='react-toggle-container'>
              <Toggle
                data-type='militaryTime'
                checked={ this.state.militaryTime }
                onChange={ this.onToggleChange.bind(this) }
              />
          </div>
          </label>
        </div>
      </SettingsTab>
    )
  }
}
