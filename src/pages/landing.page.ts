import {createBrowserHistory} from 'history'
import html from 'nanohtml'
import {css} from '../html'
import {ViewFunction} from '../main'
import {theme} from '../theme'

const actions = {
  start() {
    return [
      {type: 'start_context'},
      () => createBrowserHistory().push('/create')
    ] as const
  }
}

export type Actions = ReturnType<typeof actions[keyof typeof actions]>[0]

export const view: ViewFunction = (signal) => {
  return html` <div
    className="${css({
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    })}"
  >
    <h1>Welcome to "Jonika"</h1>
    <p
      className="${css({
        color: '#919191'
      })}"
    >
      An experiment of synthesis using WebAudio APIs.
    </p>
    <button
      className="${css({
        border: 0,
        color: 'white',
        fontWeight: 700,
        fontSize: '1rem',
        lineHeight: 1.5,
        padding: '0.5rem 1.5rem',
        backgroundColor: theme.colors.primary,
        borderRadius: '0.625rem',
        marginTop: '1.625rem',
        boxShadow: '0 4px 12px 0 #212121',
        cursor: 'pointer'
      })}"
      onclick="${signal(actions.start())}"
    >
      Start here
    </button>
  </div>`
}
