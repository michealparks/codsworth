import React from 'react'
import getFeatPic from '../../../services/wiki-feat-pic'

export default class FeatPicBackground extends React.Component {
  constructor (props) {
    super(props)

    getFeatPic().then(data => this.setState(data))

    this.state = {}
  }

  render () {
    return (
      <div className='background'>
        <div
          className='background__image'
          style={{ backgroundImage: `url('${this.state.url}')` }}
        />
        <div className='background__description' dangerouslySetInnerHTML={{ __html: this.state.description }} />
      </div>
    )
  }
}

FeatPicBackground.propTypes = {}
