import React  from 'react'

export default class BackgroundBubbles extends React.Component {
  render() {
    return (
      <div id="background-bubbles" >
        { new Array(100).fill(0).map((item, i) => <div key={ i } className="background-bubbles-bubble" />) }
      </div>
    )
  }
}