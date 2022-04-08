import html from 'nanohtml'
import {Component, mapEffect} from './runtime'

import {
  Keyboard,
  State as KeyboardState,
  Message as KeyboardMessage
} from './Keyboard'

const messages = {
  // todo: any
  keyboardMessage(data: any) {
    return {type: 'keyboard_message', data} as const
  }
}
export type State = {keyboard: KeyboardState}
export type Message =
  | ReturnType<typeof messages[keyof typeof messages]>
  | KeyboardMessage

const [keyboardState, keyboardEffect] = Keyboard.init
// todo: any
const init: [State, any] = [
  {keyboard: keyboardState},
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
      default:
        return [state]
    }
  },
  view(state, dispatch) {
    return html`<div>
      Create mode hello
      <div>${Keyboard.view(state.keyboard, dispatch)}</div>
    </div>`
  }
}
