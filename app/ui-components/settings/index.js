import React from 'react'
import Lightbox from '../lightbox/index'
import DateTimeWidgetTab from './tabs/widget-datetime'
import SearchWidgetTab from './tabs/widget-search'
import WeatherWidgetTab from './tabs/widget-weather'
import WebsitesWidgetTab from './tabs/widget-websites'

export default class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isOpen: false
    }
  }

  toggle (toShow) {
    this.setState({ isOpen: toShow })
    document.body.classList.toggle('state-settings', toShow)
  }

  render () {
    return (
      <div className='settings'>
        <Lightbox isOpen={ this.state.isOpen } toggle={ this.toggle.bind(this) }>
          <h2 className='settings__title'>codsworth</h2>
          <p className='settings__subtitle'>It's a pleasure to serve you, sir.</p>
          <DateTimeWidgetTab />
          <SearchWidgetTab />
          <WeatherWidgetTab />
          <WebsitesWidgetTab />
        </Lightbox>
        <div
          className='settings__toggle-btn'
          onTouchEnd={ this.hasTouch && this.toggle.bind(this, true) }
          onMouseUp={ !this.hasTouch && this.toggle.bind(this, true) }
        >
          <svg x='0px' y='0px' width='30.97px' height='8.025px' viewBox='0 0 30.97 8.025'>
            <path
              fill='#fff'
              d='M15.486 0c-2.274 0-4.124 1.8-4.124 4.013 0 2.212 1.85 4.012 4.124 4.012 2.273 0 4.124-1.8 4.124-4.012C19.609 1.8 17.759 0 15.486 0zM15.486 7.038c-1.715 0-3.109-1.357-3.109-3.025 0-1.668 1.394-3.025 3.109-3.025s3.109 1.357 3.109 3.025C18.595 5.681 17.2 7.038 15.486 7.038zM4.124 0C1.85 0 0 1.8 0 4.013c0 2.212 1.85 4.012 4.124 4.012 2.274 0 4.125-1.8 4.125-4.012C8.249 1.8 6.398 0 4.124 0zM4.124 7.038c-1.715 0-3.109-1.357-3.109-3.025 0-1.668 1.394-3.025 3.109-3.025 1.714 0 3.11 1.357 3.11 3.025C7.234 5.681 5.838 7.038 4.124 7.038zM26.846 0c-2.274 0-4.124 1.8-4.124 4.013 0 2.212 1.85 4.012 4.124 4.012s4.124-1.8 4.124-4.012C30.97 1.8 29.12 0 26.846 0zM26.846 7.038c-1.714 0-3.109-1.357-3.109-3.025 0-1.668 1.395-3.025 3.109-3.025 1.715 0 3.109 1.357 3.109 3.025C29.955 5.681 28.561 7.038 26.846 7.038z'/>
          </svg>
        </div>
      </div>
    )
  }
}
