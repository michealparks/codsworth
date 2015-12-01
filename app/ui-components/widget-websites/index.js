import React    from 'react'
import Settings from './settings'
import Lightbox from './../lightbox/index'

export default class WebsitesWidget extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      websites: JSON.parse(localStorage.getItem('codsworthApp_widgets_websites') || '[]'),
      isSettingsOpen: false
    }
  }

  onAddWebsite() {
    this.setState({ isSettingsOpen: true })
  }

  render() {
    return (
      <div>
        <div id="widget-websites">
          { this.state.websites.map((website, i) => (
            <div
              key={ i }
              className="widget-websites-website"
            >
              <a href={ website.url }>
                <img
                  className="widget-websites-icon"
                  width={ 100 }
                  height={ 100 }
                  src={ localStorage.getItem(`codsworthApp_icons_${website.title}`) }
                  alt={ website.title }
                />
              </a>
            </div>
          )) }
          <button
            id="widget-websites-btn-add"
            onClick={ this.onAddWebsite }
          >
            <div id="widget-websites-btn-add-vertline"></div>
            <div id="widget-websites-btn-add-horizline"></div>
          </button>
        </div>
        <Lightbox isOpen={ this.state.isSettingsOpen }>
          <Settings />
        </Lightbox>
      </div>
    )
  }
}