import React from 'react'
import BubblesBackground from '../backgrounds/bubbles/index'
import DateTimeWidget from '../widget-datetime/index'
import WeatherWidget from '../widget-weather/index'
import SearchWidget from '../widget-search/index'
import WebsitesWidget from '../widget-websites/index'

export default class App extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div className='app'>
        <BubblesBackground />
        <DateTimeWidget />
        <WeatherWidget />
        <SearchWidget />
        <WebsitesWidget />
      </div>
    )
  }
}

App.propTypes = {}
