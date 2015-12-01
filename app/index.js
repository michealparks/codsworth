
import ready    from 'document-ready-promise'
import React    from 'react'
import {render} from 'react-dom'
import App      from './ui-components/app/index'

ready().then(() => 
  render(<App />, document.body.children[0])
)