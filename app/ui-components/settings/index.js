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
  }

  render () {
    return (
      <div className='settings'>
        <Lightbox isOpen={ this.state.isOpen }>
          <h2 className='settings__title'>Codsworth</h2>
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
          <svg width='28' height='28' viewBox='0 0 24 24'>
            <path fill='#ffffff' strokeWidth='0.5' d='M12 0q1.242 0 2.121 0.879t0.879 2.121v0.516q0.367 0.125 0.883 0.359l0.359-0.359q0.883-0.883 2.125-0.883 1.234 0 2.117 0.883t0.883 2.117q0 1.242-0.883 2.125l-0.359 0.359q0.234 0.516 0.359 0.883h0.516q1.242 0 2.121 0.879t0.879 2.121-0.879 2.121-2.121 0.879h-0.516q-0.125 0.367-0.359 0.883l0.359 0.359q0.883 0.883 0.883 2.125 0 1.234-0.883 2.117t-2.117 0.883q-1.242 0-2.125-0.883l-0.359-0.359q-0.516 0.234-0.883 0.359v0.516q0 1.242-0.879 2.121t-2.121 0.879-2.121-0.879-0.879-2.121v-0.516q-0.367-0.125-0.883-0.359l-0.359 0.359q-0.883 0.883-2.117 0.883-1.242 0-2.121-0.883t-0.879-2.117q0-1.25 0.875-2.125l0.359-0.359q-0.234-0.516-0.359-0.883h-0.516q-1.242 0-2.121-0.879t-0.879-2.121 0.879-2.121 2.121-0.879h0.516q0.125-0.367 0.359-0.883l-0.359-0.359q-0.875-0.875-0.875-2.125 0-1.234 0.879-2.117t2.121-0.883q1.234 0 2.117 0.883l0.359 0.359q0.516-0.234 0.883-0.359v-0.516q0-1.242 0.879-2.121t2.121-0.879zM12 2q-0.414 0-0.707 0.293t-0.293 0.707v2.070q-1.75 0.25-3.195 1.32l-1.461-1.461q-0.297-0.297-0.703-0.297-0.414 0-0.707 0.293t-0.293 0.707q0 0.422 0.289 0.711l1.461 1.461q-1.070 1.445-1.32 3.195h-2.070q-0.414 0-0.707 0.293t-0.293 0.707 0.293 0.707 0.707 0.293h2.070q0.25 1.75 1.32 3.195l-1.461 1.461q-0.289 0.289-0.289 0.711 0 0.414 0.293 0.707t0.707 0.293q0.406 0 0.703-0.297l1.461-1.461q1.445 1.070 3.195 1.32v2.070q0 0.414 0.293 0.707t0.707 0.293 0.707-0.293 0.293-0.707v-2.070q1.75-0.25 3.195-1.32l1.461 1.461q0.297 0.297 0.711 0.297t0.707-0.293 0.293-0.707-0.297-0.711l-1.461-1.461q1.070-1.445 1.32-3.195h2.070q0.414 0 0.707-0.293t0.293-0.707-0.293-0.707-0.707-0.293h-2.070q-0.25-1.75-1.32-3.195l1.461-1.461q0.297-0.297 0.297-0.711t-0.293-0.707-0.707-0.293-0.711 0.297l-1.461 1.461q-1.445-1.070-3.195-1.32v-2.070q0-0.414-0.293-0.707t-0.707-0.293zM12 8q1.656 0 2.828 1.172t1.172 2.828-1.172 2.828-2.828 1.172-2.828-1.172-1.172-2.828 1.172-2.828 2.828-1.172zM12 10q-0.828 0-1.414 0.586t-0.586 1.414 0.586 1.414 1.414 0.586 1.414-0.586 0.586-1.414-0.586-1.414-1.414-0.586z'></path>
          </svg>
        </div>
      </div>
    )
  }
}

