import React from 'react'
import localforage from 'localforage'
import Panel from '../panel/index'
import FeatPicBackground from '../backgrounds/wiki-feat-pic/index'
import DateTimeWidget from '../widget-datetime/index'
import WeatherWidget from '../widget-weather/index'
import SearchWidget from '../widget-search/index'
import WebsitesWidget from '../widget-websites/index'
import Settings from '../settings/index'

const panels = [
  {
    name: 'home',
    widgets: [
      <DateTimeWidget key={ 0 } />,
      <WeatherWidget key={ 1 } />,
      <SearchWidget key={ 2 } />,
      <WebsitesWidget key={ 3 } />
    ]
  }
]

export default class App extends React.Component {
  constructor (props) {
    super(props)

    localforage.get('Panels').then(panels => this.setState({ panels }))
    localforage.on('Panels', panels => this.setState({ panels }))

    this.state = {
      panels: []
    }
  }

  renderPanels () {
    return this.state.panels.map((panel, i) =>
      <Panel key={ i } name={ panel.name }>
        { panels[i].widgets }
      </Panel>
    )
  }

  render () {
    return (
      <div className='app'>
        <FeatPicBackground />
        { this.renderPanels() }
        <Settings />
      </div>
    )
  }
}
