import React from 'react'

export default class DateTimeWidget extends React.Component {
  constructor(props) {
    super(props)

    this.state = { isOpen: this.props.isOpen }
  }

  toggle() {
    this.setState({ isOpen: !this.state.isOpen })
  }

  render() {
    return (
      <div id="lightbox">
        <div id="lightbox-modal">
          <div id="lightbox-modal-title">{ this.props.title || '' }</div>
          <div 
            id="lightbox-modal-btn-exit"
            onClick={ this.toggle }
          >x</div>
          <div id="lightbox-modal-content">
            { this.props.children }
          </div>
        </div>
      </div>
    )
  }
}