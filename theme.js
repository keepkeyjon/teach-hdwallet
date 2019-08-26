// Based on @mdx-deck/themes/future, and prism

import merge from 'lodash.merge'

import React from 'react'
import { Prism } from 'react-syntax-highlighter'
import highlighter from 'react-syntax-highlighter/dist/esm/styles/prism/vs-dark';

import { getLanguage } from '@mdx-deck/themes/syntax-highlighter'
import { useDeck } from 'mdx-deck'

export const createCode = (opts = {}) => props => {
  const language = getLanguage(props.className)
  return <Prism {...opts} language={language} {...props} />
}

const blue = '#0af'

let slideNo = (props) => {
    const { index, length, slug } = useDeck()
    return <div>
        { props.children }
        <div
            css={{
                position: 'fixed',
                right: 0,
                bottom: 0,
                margin: 16,
                color: '#fff',
                fontFamily: 'monospace' 
            }}
            hidden={index===0}
        >
            { index + '/' + (length - 1) }
        </div>
    </div>
}

let theme = {
    fonts: {
      body: '"Avenir Next", system-ui, sans-serif',
      monospace: 'Monaco, monospace'
    },
    colors: {
      text: '#fff',
      background: '#111',
      primary: blue,
      black: '#000',
    },
    fontWeights: {
      heading: 600,
      bold: 600,
    },
    text: {
      heading: {
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      },
    },
    styles: {
      pre: {
        color: 'primary',
        bg: 'black',
      },
      code: {
        color: 'primary',
      },
    },
    style: highlighter,
    Provider: props => slideNo(props)
  }

  export default merge(theme,
    {
      components: {
        pre: props => props.children,
        code: createCode(theme),
      }
    })