
import React from 'react'
import Lightbox from '../lightbox/index'
import DateTimeWidgetTab from './tabs/widget-datetime'
import SearchWidgetTab from './tabs/widget-search'
import WeatherWidgetTab from './tabs/widget-weather'
import WebsitesWidgetTab from './tabs/widget-websites'

export default class Settings extends React.Component {
  constructor (props) {
    super(props)

    this.state = {}
  }

  render () {
    return (
      <Lightbox isOpen={ this.state.isSettingsOpen }>
        <nav className='lightbox__nav'>
          <span className='lightbox__nav-item--active'>Date / Time</span>
          <span className='lightbox__nav-item'>Search</span>
          <span className='lightbox__nav-item'>Weather</span>
          <span className='lightbox__nav-item'>Websites</span>
        </nav>
        <div className='lightbox__tabs'>
          <DateTimeWidgetTab />
          <SearchWidgetTab />
          <WeatherWidgetTab />
          <WebsitesWidgetTab />
        </div>
      </Lightbox>
    )
  }
}

Settings.propTypes = {}
