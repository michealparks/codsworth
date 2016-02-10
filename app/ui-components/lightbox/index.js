import React from 'react'
import { VelocityComponent } from 'velocity-react'

export default class Lightbox extends React.Component {
  constructor (props) {
    super(props)

    this.animDuration = 450
    this.state = {
      isOpen: this.props.isOpen,
      isHidden: this.props.isHidden
    }
  }

  componentWillUpdate (nextProps, nextState) {
    this.state.isOpen = nextProps.isOpen
    if (nextProps.isOpen) this.state.isHidden = false
  }

  onBackgroundPress (e) {
    if (e.target.classList.contains('lightbox')) {
      this.props.toggle(false)
    }
  }

  render () {
    return (
      <VelocityComponent
        animation={{ opacity: this.state.isOpen ? 1 : 0 }}
        duration={ this.animDuration }
        complete={ () => !this.state.isOpen && this.setState({ isHidden: true }) }
      >
        <div
          className={ `lightbox ${ this.state.isHidden ? 'state-hidden' : '' }` }
          onTouchEnd={ this.hasTouch && this.onBackgroundPress.bind(this) }
          onMouseUp={ !this.hasTouch && this.onBackgroundPress.bind(this) }
        >
          <VelocityComponent
            animation={{
              translateZ: 0,
              translateX: this.state.isOpen ? 0 : 300 * this.props.slideInDirection
            }}
            duration={ this.animDuration }
            easing='easeOutQuint'
          >
            <div className='lightbox__modal'>
              <div className='lightbox__modal-title'>{ this.props.title || '' }</div>
              <button
                className='lightbox__modal-btn-exit'
                onTouchEnd={ this.hasTouch && this.props.toggle.bind(this, false) }
                onMouseUp={ !this.hasTouch && this.props.toggle.bind(this, false) }
              >
                <svg width='24' height='24' viewBox='0 0 24 24'>
                  <path fill='#555' d='M19 4q0.43 0 0.715 0.285t0.285 0.715q0 0.422-0.289 0.711l-6.297 6.289 6.297 6.289q0.289 0.289 0.289 0.711 0 0.43-0.285 0.715t-0.715 0.285q-0.422 0-0.711-0.289l-6.289-6.297-6.289 6.297q-0.289 0.289-0.711 0.289-0.43 0-0.715-0.285t-0.285-0.715q0-0.422 0.289-0.711l6.297-6.289-6.297-6.289q-0.289-0.289-0.289-0.711 0-0.43 0.285-0.715t0.715-0.285q0.422 0 0.711 0.289l6.289 6.297 6.289-6.297q0.289-0.289 0.711-0.289z'></path>
                </svg>
              </button>
              <div id='lightbox__modal-content'>
                { this.props.children }
              </div>
            </div>
          </VelocityComponent>
        </div>
      </VelocityComponent>
    )
  }
}

const { string, node, bool, func, number } = React.PropTypes

Lightbox.propTypes = {
  title: string,
  isOpen: bool,
  isHidden: bool,
  slideInDirection: number,
  children: node.isRequired,
  toggle: func.isRequired
}

Lightbox.defaultProps = {
  isOpen: false,
  isHidden: true,
  slideInDirection: -1
}
