import React from 'react'
import Toggle from 'react-toggle'
import localforage from 'localforage'
import { VelocityTransitionGroup } from 'velocity-react'

export default class SettingsTab extends React.Component {
  constructor (props) {
    super(props)

    localforage.get('Panels').then(panels =>
      this.setState({ isActive: panels.filter(panel =>
        panel.widgets.includes(this.props.widget)
      ).length !== 0 })
    )

    this.state = {
      isOpen: false,
      isActive: false
    }
  }

  toggle (e) {
    console.log(e.target.className.includes('react-toggle'))
    if (e.target.className.includes('react-toggle')) {
      return
    }
    this.setState({ isOpen: !this.state.isOpen })
  }

  onActiveToggle (e) {
    const { checked } = e.target
    localforage.get('Panels').then(panels =>
      localforage.set('Panels', panels.map(panel => {
        const index = panel.widgets.indexOf(this.props.widget)

        if (checked && index === -1) {
          panel.widgets.push(this.props.widget)
        }

        if (!checked && index > -1) {
          panel.widgets.splice(index, 1)
        }

        return panel
      }), true)
    )
    .catch(console.error.bind(console))

    this.setState({ isActive: !this.state.isActive })
  }

  render () {
    return (
      <div className='settings-tab'>
        <div
          className='settings-tab__header'
          onTouchEnd={ this.hasTouch && this.toggle.bind(this) }
          onMouseUp={ !this.hasTouch && this.toggle.bind(this) }
        >
          <h4 className='settings-tab__title'>
            { this.props.title }
          </h4>
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
