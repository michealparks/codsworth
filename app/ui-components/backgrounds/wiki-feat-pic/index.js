import React from 'react'
import localforage from 'localforage'
import getFeatPic from '../../../services/wiki-feat-pic'

export default class FeatPicBackground extends React.Component {
  constructor (props) {
    super(props)

    localforage.on('Backgrounds.FeatPic', data =>
      this.setState(data)
    )

    getFeatPic().then(data => {
      console.log(data)
      this.setState(data)
    })

    this.state = {}
  }

  render () {
    return (
      <div className='background'>
        <div
          className='background__image'
          style={{ backgroundImage: `url('${this.state.url}')` }}
        />
        <div
          className='background__description'
          dangerouslySetInnerHTML={{ __html: this.state.description }}
        />
      </div>
    )
  }
}

FeatPicBackground.propTypes = {}
