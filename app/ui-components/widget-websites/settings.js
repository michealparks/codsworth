import React           from 'react'
import {readAsDataURL} from '../../services/file-reader'

export default class WebsitesWidgetSettings extends React.Component {
  constructor(props) {
    super(props)
    this.reader.onloadend = this.updateData.bind(this)
  }

  onAddItem() {
    readAsDataURL(this.refs.imgInput.files[0], dataURL => {
      
    })
  }

  render() {
    return (
      <div>
        <input placeholder="Title" />
        <input placeholder="URL" />
        <input placeholder="Image Icon" type="file" ref="imgInput" />
        <button onClick={ this.onAddItem }>Add</button>
      </div>
    )
  }
}