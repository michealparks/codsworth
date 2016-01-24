import React from 'react'
import Toggle from 'react-toggle'
import localforage from 'localforage'
import { VelocityTransitionGroup } from 'velocity-react'

export default class SettingsTab extends React.Component {
  constructor (props) {
    super(props)

    localforage.get('Widgets.active').then(widgets =>
      this.setState({ isActive: widgets.includes(this.props.widget) })
    )

    this.state = {
      isOpen: false,
      isActive: false
    }
  }

  toggle (e) {
    this.setState({ isOpen: !this.state.isOpen })
  }

  onActiveToggle (e) {
    const { checked } = e.target
    localforage.get('Widgets.active').then(widgets => {
      const index = widgets.indexOf(this.props.widget)
      if ((checked && index !== -1) || (!checked && index === -1)) {
        return
      } else if (checked) {
        widgets.push(this.props.widget)
      } else {
        widgets.splice(index, 1)
      }

      localforage.set('Widgets.active', widgets)
      localforage.emit('Widgets.active', widgets)
    })

    this.setState({ isActive: !this.state.isActive })
  }

  render () {
    return (
      <div className='settings-tab'>
        <div className='settings-tab__header'>
          <h4
            className='settings-tab__title'
            onTouchEnd={ this.hasTouch && this.toggle.bind(this) }
            onMouseUp={ !this.hasTouch && this.toggle.bind(this) }
          >{ this.props.title }</h4>
          <div className='react-toggle-container'>
            <Toggle
              checked={ this.state.isActive }
              onChange={ this.onActiveToggle.bind(this) }
            />
          </div>
        </div>
        <VelocityTransitionGroup
          component='div'
          enter={{
            animation: 'slideDown',
            duration: 300,
            style: { height: '' }
          }}
          leave={{
            animation: 'slideUp',
            duration: 300
          }}>
            { this.state.isOpen && this.props.children }
        </VelocityTransitionGroup>
      </div>
    )
  }
}

const { node, string } = React.PropTypes

SettingsTab.propTypes = {
  title: string.isRequired,
  widget: string.isRequired,
  children: node.isRequired
}
