import React from 'react'
import { ls } from '../../services/storage'

export default class WebsitesWidget extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      websites: ls.getJSON('Codsworth.Widgets.Websites.list') || []
    }
  }

  onAddWebsite () {
    this.setState({ isSettingsOpen: true })
  }

  render () {
    return (
      <div>
        <div className='widget-websites'>
          { this.state.websites.map((website, i) => (
            <div key={ i } className='widget-websites__website' >
              <a href={ website.url }>
                <img
                  className='widget-websites__website-icon'
                  width={ 100 }
                  height={ 100 }
                  src={ website.imgDataUrl }
                  alt={ website.title }
                />
              </a>
            </div>
          )) }
        </div>
      </div>
    )
  }
}

WebsitesWidget.propTypes = {}
