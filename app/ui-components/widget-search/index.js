import React from 'react'
import localforage from 'localforage'

export default class SearchWidget extends React.Component {
  constructor (props) {
    super(props)

    localforage.get('Search.engine')
      .then(data => this.setState(data))

    this.state = {
      name: 'Google',
      url: 'https://www.google.com/search?q='
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
          tabIndex='1'
          className='widget-search__input'
          placeholder={ `Search ${this.state.name}` }
          onKeyDown={ this.search.bind(this) }
        />
      </div>
    )
  }
}

SearchWidget.propTypes = {}
