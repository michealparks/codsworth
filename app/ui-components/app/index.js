import React from 'react'
import localforage from 'localforage'
import FeatPicBackground from '../backgrounds/wiki-feat-pic/index'
import DateTimeWidget from '../widget-datetime/index'
import WeatherWidget from '../widget-weather/index'
import SearchWidget from '../widget-search/index'
import WebsitesWidget from '../widget-websites/index'
import Settings from '../settings/index'

const widgets = {
  'DateTimeWidget': i => <DateTimeWidget key={ i } />,
  'WeatherWidget': i => <WeatherWidget key={ i } />,
  'SearchWidget': i => <SearchWidget key={ i } />,
  'WebsitesWidget': i => <WebsitesWidget key= { i } />
}

export default class App extends React.Component {
  constructor (props) {
    super(props)

    localforage.get('Widgets.active')
      .then(this.updateWidgets.bind(this))
    localforage
      .on('Widgets.active', this.updateWidgets.bind(this))

    this.state = {
      widgets: []
    }
  }

  updateWidgets (widgets) {
    console.log(widgets)
    this.setState({ widgets })
  }

  render () {
    return (
      <div className='app'>
        <FeatPicBackground />
        { this.state.widgets.map((widget, i) => widgets[widget](i)) }
        <Settings />
      </div>
    )
  }
}
