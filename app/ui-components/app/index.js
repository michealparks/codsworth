import React from 'react'
import FeatPicBackground from '../backgrounds/wiki-feat-pic/index'
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
        <FeatPicBackground />
        <DateTimeWidget />
        <WeatherWidget />
        <SearchWidget />
        <WebsitesWidget />
      </div>
    )
  }
}

App.propTypes = {}
