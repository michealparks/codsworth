import React from 'react'
import Lightbox from '../lightbox/index'

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
          <h2 className='settings__title'>Codsworth</h2>
          <p className='settings__subtitle'>It's a pleasure to serve you, sir.</p>
        </Lightbox>
        <div
          className='settings__toggle-btn'
          onTouchEnd={ this.hasTouch && this.toggle.bind(this, true) }
          onMouseUp={ !this.hasTouch && this.toggle.bind(this, true) }
        >
        </div>
      </div>
    )
  }
}
