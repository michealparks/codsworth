import React from 'react'

export default class IconsWidget extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      engine: 'Google',
      searchURL: 'http://www.google.com/search?q='
    }
  }

  search(e) {
    if (e.keyCode === 13) {
      window.location.href = `${this.state.searchURL}${encodeURI(e.target.value)}`
    }
  }

  render() {
    return (
      <div id="widget-search">
        <input
          id="widget-search-input"
          ref={ input => input.focus() }
          placeholder={ `Search ${this.state.engine}` }
          onKeyDown={ this.search.bind(this) }
        />
      </div>
    )
  }
}