import React from 'react'

export default class Panel extends React.Component {
  constructor (props) {
    super(props)

    this.state = {}
  }

  render () {
    return (
      <div className='panel'>
        { this.props.children }
      </div>
    )
  }
}

const { node } = React.PropTypes

Panel.propTypes = {
  children: node.isRequired
}
