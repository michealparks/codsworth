import React from 'react'
import localforage from 'localforage'
import { readAsDataURL } from '../../../services/file-reader'

export default class WebsitesWidgetSettings extends React.Component {
  constructor (props) {
    super(props)
  }

  readImage () {
    readAsDataURL(this.refs.imgInput.files[0])
      .then(dataURL => this.refs.preview.src = dataURL)
  }

  updateWebsites () {
    localforage.get('Websites.list').then(websites =>
      localforage.set('Websites.list', websites.concat({
        title: this.refs.titleInput.value,
        url: this.refs.urlInput.value,
        imgDataUrl: this.refs.preview.src
      }))
    )
  }

  render () {
    return (
      <div>
        <input ref='titleInput' placeholder='Title' />
        <input ref='urlInput' placeholder='URL' />
        <input
          placeholder='Image Icon'
          type='file'
          ref='imgInput'
          onChange={ this.readImage.bind(this) }
          />
        <img ref='preview' height='50' width='50' />
        <button onClick={ this.updateWebsites.bind(this) }>Add</button>
      </div>
    )
  }
}
