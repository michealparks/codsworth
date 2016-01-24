import React from 'react'
import SettingsTab from './tab'

export default class SearchWidgetTab extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <SettingsTab title='Search' widget='SearchWidget'>
        <div className='settings-tab__content'>

        </div>
      </SettingsTab>
    )
  }
}
