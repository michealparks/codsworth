import React from 'react'

localStorage.setItem('codsworthApp_widgets_search', JSON.stringify({
  engine: {
    name: 'Google',
    api: 'https://www.google.com/search?q='
  }
}))

export default class IconsWidget extends React.Component {
  constructor(props) {
    super(props)
    this.state = JSON.parse(localStorage.getItem('codsworthApp_widgets_search'))    
  }

  search(e) {
    if (e.keyCode !== 13) return

    window.location.href = `${this.state.engine.api}${encodeURI(e.target.value)}`
  }

  render() {
    return (
      <div id="widget-search">
        <input
          id="widget-search-input"
          ref={ input => input.focus() }
          placeholder={ `Search ${this.state.engine.name}` }
          onKeyDown={ this.search }
        />
      </div>
    )
  }
}