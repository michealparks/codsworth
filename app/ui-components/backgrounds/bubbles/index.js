import React from 'react'

export default class BackgroundBubbles extends React.Component {
  render () {
    return (
      <div className='bg1'>
        { new Array(100).fill(0).map((item, i) => <div key={ i } className='bg1__bubble' />) }
      </div>
    )
  }
}

BackgroundBubbles.propTypes = {}
