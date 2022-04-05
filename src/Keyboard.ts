import html from 'nanohtml'
import {Component} from 'runtime'

const CharToNoteOffset = {
  a: 0,
  w: 1,
  s: 2,
  e: 3,
  d: 4,
  f: 5,
  t: 6,
  g: 7,
  y: 8,
  h: 9,
  u: 10,
  j: 11,
  k: 12,
  o: 13,
  l: 14,
  p: 15
}

let octave = 2

export const actions = {
  noteOn: (note: number, velocity: number) => {
    return {type: 'note_on', note, velocity} as const
  },
  noteOff: (note: number) => {
    return {type: 'note_off', note} as const
  }
}

export type Message = ReturnType<typeof actions[keyof typeof actions]>

type Note = {velocity: number}
type State = {[key: number]: Note}

export const Keyboard: Component<State, Message> = {
  init: [
    {},
    (dispatch) => {
      window.addEventListener('keydown', (event) => {
        const note = octave * 12 + CharToNoteOffset[event.key]
        if (note !== NaN) {
          dispatch(actions.noteOn(note, 100))
        }
      })

      window.addEventListener('keyup', (event) => {
        if (event.key === 'z' && octave !== -1) {
          octave -= 1
        } else if (event.key === 'x' && octave !== 9) {
          octave += 1
        } else {
          const note = octave * 12 + CharToNoteOffset[event.key]
          if (note !== NaN) {
            dispatch(actions.noteOff(note))
          }
        }
      })
    }
  ],
  update(message, state) {
    switch (message.type) {
      case 'note_on': {
        if (state[message.note] !== undefined) {
          return [state]
        }

        const newState = {
          ...state,
          [message.note]: {velocity: message.velocity}
        }
        return [newState]
      }
      case 'note_off': {
        const newState = JSON.parse(JSON.stringify(state))
        delete newState[message.note]
        return [newState]
      }
    }
  },
  view(state, dispatch) {
    return html`<div>${JSON.stringify(state)}</div>`
  }
}
