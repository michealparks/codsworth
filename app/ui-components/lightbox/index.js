import React from 'react'

export default class DateTimeWidget extends React.Component {
  constructor (props) {
    super(props)

    this.state = { isOpen: this.props.isOpen }
  }

  componentWillUpdate (nextProps, nextState) {
    this.state.isOpen = nextProps.isOpen
  }

  toggle () {
    this.setState({ isOpen: !this.state.isOpen })
  }

  render () {
    return (
      <div className={ `lightbox ${this.state.isOpen ? '' : 'state-hidden'}` }>
        <div className='lightbox__modal'>
          <div className='lightbox__modal-title'>{ this.props.title || '' }</div>
          <button
            id='lightbox__modal-btn-exit'
            onClick={ this.toggle.bind(this) }
          >x</button>
          <div id='lightbox__modal-content'>
            { this.props.children }
          </div>
        </div>
      </div>
    )
  }
}

DateTimeWidget.defaultProps = { isOpen: false }
