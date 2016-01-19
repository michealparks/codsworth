import React from 'react'
import localforage from 'localforage'

export default class WebsitesWidget extends React.Component {
  constructor (props) {
    super(props)

    localforage.get('Websites.list')
      .then(websites => this.setState({ websites }))

    this.state = { websites: [] }
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
