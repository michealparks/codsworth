import React from 'react'
import { ls } from '../../services/storage'

export default class IconsWidget extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: ls.get('Codsworth.Widgets.Search.engine.name'),
      href: ls.get('Codsworth.Widgets.Search.engine.href')
    }
  }

  search (e) {
    if (e.keyCode !== 13) return
    window.location.href = `${this.state.href}${encodeURI(e.target.value)}`
  }

  render () {
    return (
      <div className='widget-search'>
        <input
          className='widget-search__input'
          ref={ input => input.focus() }
          placeholder={ `Search ${this.state.name}` }
          onKeyDown={ this.search.bind(this) }
        />
      </div>
    )
  }
}

IconsWidget.propTypes = {}
