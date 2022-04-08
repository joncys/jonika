import {css} from './html'
import html from 'nanohtml'
import {Component} from './runtime'

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
export type State = {[key: number]: Note}

export const Keyboard: Component<State, Message> = {
  init: [
    {},
    (dispatch) => {
      window.addEventListener('keydown', (event) => {
        const note = octave * 12 + CharToNoteOffset[event.key]
        if (!isNaN(note)) {
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
          if (!isNaN(note)) {
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
    const startKey = octave * 12
    const piano = Array(12)
      .fill(startKey)
      .map((v, i) => v + i)
    return html`<div
      className="${css({
        position: 'relative',
        display: 'flex',
        flexDirection: 'row'
      })}"
    >
      ${piano.map((note) => {
        return html`<div
          className="${css({
            ...(isWhiteKey(note)
              ? {
                  position: 'relative',
                  width: '50px',
                  height: '200px',
                  backgroundColor: state[note] ? 'tomato' : 'white',
                  borderLeft: '1px solid gray',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  boxSizing: 'border-box',
                  paddingLeft: '4px',
                  paddingBottom: '4px',
                  color: state[note] ? 'white' : 'gray'
                }
              : {
                  position: 'absolute',
                  width: '30px',
                  height: '130px',
                  backgroundColor: state[note] ? 'tomato' : 'black',
                  left: `${blackKeyToOffset(note % 12) * 51 + 35}px`,
                  zIndex: 1
                })
          })}"
        >
          ${note % 12 === 0 ? `C${Math.floor(note / 12)}` : ''}
        </div>`
      })}
    </div>`
  }
}

const isWhiteKey = (note: number) => {
  return [0, 2, 4, 5, 7, 9, 11].includes(note % 12)
}

const blackKeyToOffset = (note: number) => {
  return {1: 0, 3: 1, 6: 3, 8: 4, 10: 5}[note]
}
