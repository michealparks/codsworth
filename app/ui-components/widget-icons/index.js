import React from 'react'

export default class IconsWidget extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      icons: []
    }
  }

  render() {
    return (
      <div id="widget-icons">
        { this.state.icons.map(icon => (
          <div className="widget-icons-icon">
            <img 
              className="widget-icons-icon-image" 
              src={ icon.src } 
              alt={ icon.title } />
          </div>
        )) }
      </div>
    )
  }
}