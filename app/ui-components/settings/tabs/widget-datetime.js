import React from 'react'
import SettingsTab from './tab'
import localforage from 'localforage'

export default class DateTimeWidgetTab extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <SettingsTab title='Date & Time' widget='DateTimeWidget'>
        <div className='settings-tab__content'>
          <label>
            <span>Show Seconds</span>
            <input checkbox />
          </label>
          <label>
            <span>24 Hour Time</span>
            <input checkbox />
          </label>
        </div>
      </SettingsTab>
    )
  }
}
