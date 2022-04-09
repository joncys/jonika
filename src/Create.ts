import html from 'nanohtml'
import {Component, mapEffect} from './runtime'

import {
  Keyboard,
  State as KeyboardState,
  Message as KeyboardMessage
} from './Keyboard'
import {css} from './html'

const messages = {
  // todo: any
  keyboardMessage(data: any) {
    return {type: 'keyboard_message', data} as const
  },
  initContext() {
    return {type: 'init_context'} as const
  }
}
export type State = {keyboard: KeyboardState; context: AudioContext | null}
export type Message =
  | ReturnType<typeof messages[keyof typeof messages]>
  | KeyboardMessage

const [keyboardState, keyboardEffect] = Keyboard.init
// todo: any
const init: [State, any] = [
  {keyboard: keyboardState, context: null},
  mapEffect(keyboardEffect, messages.keyboardMessage)
]

export const Create: Component<State, Message> = {
  init,
  update(message, state) {
    switch (message.type) {
      case 'keyboard_message': {
        const [keyboardState, keyboardEffect] = Keyboard.update(
          message.data,
          state.keyboard
        )
        const newState = {...state, keyboard: keyboardState}
        return [newState, mapEffect(keyboardEffect, messages.keyboardMessage)]
      }
      case 'init_context': {
        const context = new AudioContext()
        return [{...state, context}]
      }
      default:
        return [state]
    }
  },
  view(state, dispatch) {
    return html`<div
      className="${css({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      })}"
    >
      ${!state.context ? modal(dispatch) : null}
      <div
        className="${css({
          display: 'flex',
          flexDirection: 'column',
          ...(!state.context
            ? {
                flex: 1,
                filter: 'blur(12px) grayscale(100%)'
              }
            : {})
        })}"
      >
        <div
          className="${css({
            position: 'absolute',
            height: '160px',
            left: 0,
            right: 0,
            bottom: 0
          })}"
        >
          ${Keyboard.view(state.keyboard, dispatch)}
        </div>
      </div>
    </div>`
  }
}

const modal = (dispatch) => {
  return html`<div
    className="${css({
      position: 'fixed',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      zIndex: 1000
    })}"
  >
    <div
      className="${css({
        position: 'absolute',
        backgroundColor: 'rgba(33, 33, 33, .7)',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      })}"
    ></div>
    <div
      className="${css(($theme) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px',
        backgroundColor: $theme.colors.backgroundPrimary,
        borderRadius: '20px',
        boxShadow: '0 0 32px 10px rgba(0, 0, 0, .3)',
        zIndex: 1
      }))}"
    >
      <h1>Welcome to "Jonika"</h1>
      <p
        className="${css({
          color: '#919191',
          maxWidth: '560px',
          textAlign: 'center'
        })}"
      >
        In order to enable sound generation this needs access to AudioContext
        API. This must be requested / granted on a user interaction.
      </p>
      <button
        className="${css((theme) => ({
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
        }))}"
        onclick="${() => {
          console.log('create mode')
          dispatch(messages.initContext())
        }}"
      >
        Start here
      </button>
    </div>
  </div>`
}
