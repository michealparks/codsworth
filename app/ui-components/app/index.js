import React             from 'react'
import BubblesBackground from '../backgrounds/bubbles/index'
import DateTimeWidget    from '../widget-datetime/index'
import SearchWidget      from '../widget-search/index'
import IconsWidget       from '../widget-icons/index'

export default class App extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id='app'>
        <BubblesBackground />
        <DateTimeWidget />
        <SearchWidget />
        <IconsWidget />
      </div>
    )
  }
}

