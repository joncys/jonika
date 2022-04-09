import {css} from './html'
import html from 'nanohtml'
import {Component} from './runtime'

import {createKeyListener} from './key-listener'

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

export const actions = {
  keyDown(key: string) {
    return {type: 'keyboard_down', key} as const
  },
  keyUp(key: string) {
    return {type: 'keyboard_up', key} as const
  }
}

export type Message = ReturnType<typeof actions[keyof typeof actions]>

type Note = {velocity: number}
export type State = {octave: number; notes: {[key: number]: Note}}

export const Keyboard: Component<State, Message> = {
  init: [
    {octave: 0, notes: {}},
    (dispatch) => {
      const listener = createKeyListener(window)
      listener.addKeyDownHandler((event) =>
        dispatch(actions.keyDown(event.key))
      )
      listener.addKeyUpHandler((event) => dispatch(actions.keyUp(event.key)))
    }
  ],
  update(message, state) {
    switch (message.type) {
      case 'keyboard_down': {
        if (message.key === 'z') {
          return [{...state, octave: Math.max(state.octave - 1, 0)}]
        }
        if (message.key === 'x') {
          return [{...state, octave: Math.min(state.octave + 1, 8)}]
        }
        const note = keyToNote(message.key, state.octave)
        if (!isNaN(note)) {
          return [{...state, notes: {...state.notes, [note]: {velocity: 100}}}]
        }
      }
      case 'keyboard_up': {
        const note = keyToNote(message.key, state.octave)
        if (!isNaN(note)) {
          const newNotes = {...state.notes}
          delete newNotes[note]
          return [{...state, notes: newNotes}]
        }
      }
      default:
        return [state]
    }
  },
  view(state, dispatch) {
    const startKey = state.octave * 12 - 7
    const piano: number[] = Array(43)
      .fill(startKey)
      .map((v, i) => v + i)
    return html`<div
      className="${css({
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100%'
      })}"
    >
      ${piano.map((note) => {
        return isWhiteKey(note)
          ? html`<div
              className="${css(() => {
                const active = state.notes[note]
                return {
                  position: 'relative',
                  flex: '1 1 0px',
                  backgroundColor: active ? 'tomato' : 'white',
                  borderLeft: '1px solid gray',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  boxSizing: 'border-box',
                  paddingLeft: '4px',
                  paddingBottom: '4px',
                  color: active ? 'white' : 'gray'
                }
              })}"
            >
              ${!isWhiteKey(note + 1)
                ? html`<div
                    className="${css(() => {
                      const active = state.notes[note + 1]
                      return {
                        position: 'absolute',
                        backgroundColor: active ? 'tomato' : 'black',
                        top: 0,
                        left: '70%',
                        bottom: '33%',
                        right: '-30%',
                        zIndex: 1
                      }
                    })}"
                  ></div>`
                : null}
              ${note % 12 === 0 ? `C${Math.floor(note / 12)}` : null}
            </div>`
          : null
      })}
    </div>`
  }
}

const keyToNote = (key: string, octave: number) =>
  octave * 12 + CharToNoteOffset[key]

const isWhiteKey = (note: number) => {
  return [0, 2, 4, 5, 7, 9, 11].includes((note + 12) % 12)
}
