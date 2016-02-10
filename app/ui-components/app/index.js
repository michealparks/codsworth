import React, { createElement } from 'react'
import localforage from 'localforage'
import Panel from '../panel/index'
import FeatPicBackground from '../backgrounds/wiki-feat-pic/index'
import Settings from '../settings/index'
import Widgets from './widgets'

export default class App extends React.Component {
  constructor (props) {
    super(props)

    localforage.get('Panels').then(panels =>
      this.setState({ panels }))
    localforage.on('Panels', panels =>
      this.setState({ panels }))

    this.state = {
      panels: []
    }
  }

  renderPanels () {
    return this.state.panels.map((panel, i) =>
      <Panel key={ i } name={ panel.name }>
        { panel.widgets.map((widgetName, ii) =>
          createElement(Widgets[widgetName], { key: ii }))
        }
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
