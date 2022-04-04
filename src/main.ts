import morph from 'nanomorph'
import html from 'nanohtml'

import {css} from './html'

import * as landing from './pages/landing.page'
import * as create from './pages/create.page'
import * as page_404 from './pages/404.page'

import {createBrowserHistory} from 'history'

const app = document.querySelector('.app--inner') as HTMLDivElement

const state: {audioContext: AudioContext | null; inputs: any[]} = {
  audioContext: null,
  inputs: []
}

export type State = typeof state
export type Action = landing.Actions
export type UpdateFunction = (state: State, action: Action) => State
export type SignalFunction = (
  actionAndEffect: readonly [Action, Function]
) => () => void
export type ViewFunction = (signal: SignalFunction, state: State) => HTMLElement

const update: UpdateFunction = (state: State, action: Action) => {
  switch (action.type) {
    case 'start_context': {
      const ctx = new window.AudioContext()
      return {
        ...state,
        audioContext: ctx
      }
    }
    default:
      return state
  }
}

const view: ViewFunction = (signal, state) => {
  const history = createBrowserHistory()
  console.log(history.location.pathname, history.location)
  switch (history.location.pathname) {
    case '/':
      return landing.view(signal, state)
    case '/create':
      return create.view(signal, state)
    default:
      return page_404.view(signal, state)
  }
}

const mount = (
  state: State,
  update: UpdateFunction,
  view: ViewFunction,
  element: HTMLElement
) => {
  let currentState = state
  const signal: SignalFunction = (actionAndEffect) => {
    return () => {
      const [action, effect] = actionAndEffect
      currentState = update(state, action)
      console.log('updated', currentState)
      morph(html, view(signal, currentState))

      if (typeof effect === 'function') {
        effect()
        morph(html, view(signal, currentState))
      }
    }
  }
  let html = view(signal, currentState)
  element.appendChild(html)
}

mount(state, update, view, app)

let PLAYING_NOTES = {}

const AudioCtx = window.AudioContext
let ctx: AudioContext

const start = html`
  <div
    class="${css({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1
    })}"
  >
    <button
      class="${css({
        padding: '30px',
        backgroundColor: '#eee',
        border: '2px solid #777'
      })}"
    >
      Start
    </button>
  </div>
`
window.addEventListener('mouseup', (event) => {
  console.log('stop')
  stopAll()
  rerender()
})
// app.appendChild(start)
start.querySelector('button').addEventListener('click', (event) => {
  ctx = new AudioCtx()
  console.log('wow')
})

const charToNoteOffset = {
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

let keyboardOffset = 60
const keyboardPressed = {}
window.addEventListener('keydown', (event) => {
  if (event.key === 'z') keyboardOffset -= 12
  if (event.key === 'x') keyboardOffset += 12

  const noteOffset = charToNoteOffset[event.key]
  if (noteOffset === undefined) return
  if (keyboardPressed[noteOffset]) return

  const midi = {
    type: 'note_on',
    note: keyboardOffset + noteOffset,
    channel: 144,
    velocity: 100
  }
  playNote(midi)
  keyboardPressed[noteOffset] = midi
})
window.addEventListener('keyup', (event) => {
  const noteOffset = charToNoteOffset[event.key]
  if (keyboardPressed[noteOffset]) {
    stopNote(keyboardPressed[noteOffset])
    keyboardPressed[noteOffset] = undefined
  }
})

const piano = generatePianoRoll()
// app.appendChild(piano)

function rerender() {
  morph(piano, generatePianoRoll())
}

navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)

function onMIDISuccess(midiAccess: WebMidi.MIDIAccess) {
  var inputs = midiAccess.inputs
  var outputs = midiAccess.outputs

  Array.from(midiAccess.inputs.values()).forEach((input) => {
    input.onmidimessage = getMIDIMessage
  })
}

function isBlackKey(note: number) {
  const relative = note % 12
  if (relative < 4) return relative % 2 === 1
  if (relative > 5) return relative % 2 === 0
  return false
}

function parseMidi(midiData: Uint8Array) {
  let type
  let note
  let velocity
  let channel
  const code = midiData[0]

  if (code === 252) {
    type = 'stop'
    return {type}
  }

  if (code >= 144 && code <= 159) {
    type = 'note_on'
    note = midiData[1]
    velocity = midiData.length > 2 ? midiData[2] : 0
    channel = code - 144
    return {type, note, velocity, channel}
  }

  if (code >= 128 && code <= 143) {
    type = 'note_off'
    note = midiData[1]
    velocity = midiData.length > 2 ? midiData[2] : 0
    channel = code - 128
    return {type, note, velocity, channel}
  }

  return {type: 'unknown'}
}

function midiNoteToHz(note: number): number {
  return Math.pow(2, (note - 69) / 12) * 440
}

function playNote(midi: ReturnType<typeof parseMidi>) {
  if (ctx) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const hz = midiNoteToHz(midi.note)
    osc.frequency.value = hz
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    PLAYING_NOTES[midi.note] = {osc, gain}
  }
}

function stopNote(midi: ReturnType<typeof parseMidi>) {
  if (ctx) {
    const {osc, gain} = PLAYING_NOTES[midi.note]
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03)
    osc.stop(ctx.currentTime + 0.04)
    PLAYING_NOTES[midi.note] = undefined
  }
}

function stopAll() {
  if (ctx) {
    Object.keys(PLAYING_NOTES).forEach((note) => {
      const {osc, gain} = PLAYING_NOTES[note]
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03)
      osc.stop(ctx.currentTime + 0.04)
    })
    PLAYING_NOTES = {}
  }
}

function getMIDIMessage(midiMessage: WebMidi.MIDIMessageEvent) {
  const midi = parseMidi(midiMessage.data)

  switch (midi.type) {
    case 'note_on':
      playNote(midi)
      break
    case 'note_off':
      stopNote(midi)
      break
    case 'stop':
      stopAll()
      break
  }

  rerender()
}

function onMIDIFailure() {
  console.log('Could not access your MIDI devices.')
}

function generatePianoRoll() {
  const WHITE_KEY_WIDTH = 30
  const WHITE_KEY_HEIGHT = 80
  const BLACK_KEY_WIDTH = 18
  const BLACK_KEY_HEIGHT = 40
  const keys = 128

  function getBlackKeyPositionOffset(note: number): number {
    const octave = Math.floor(note / 12)
    const key = note % 12
    let offset
    switch (key) {
      case 1:
        offset = WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2
        break
      case 3:
        offset = WHITE_KEY_WIDTH * 2 - BLACK_KEY_WIDTH / 2
        break
      case 6:
        offset = WHITE_KEY_WIDTH * 4 - BLACK_KEY_WIDTH / 2
        break
      case 8:
        offset = WHITE_KEY_WIDTH * 5 - BLACK_KEY_WIDTH / 2
        break
      case 10:
        offset = WHITE_KEY_WIDTH * 6 - BLACK_KEY_WIDTH / 2
        break
    }
    return octave * WHITE_KEY_WIDTH * 7 + offset
  }

  const container = html`
    <div
      id="piano-roll"
      class="${css({
        position: 'absolute',
        width: '100vw',
        bottom: 0,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'row',
        height: `${WHITE_KEY_HEIGHT}px`
      })}"
    ></div>
  `

  for (let i = 0; i < keys; i++) {
    let key
    if (!isBlackKey(i)) {
      key = html`
        <div
          id="piano-roll-key-${key}"
          class="${css({
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: `${WHITE_KEY_WIDTH}px`,
            height: `${WHITE_KEY_HEIGHT}px`,
            backgroundColor: PLAYING_NOTES[i] ? 'tomato' : '#eee',
            border: '1px solid #aaa',
            flexShrink: 0,
            transition: `background-color ${PLAYING_NOTES[i] ? 0.15 : 0.4}s`
          })}"
        ></div>
      `
      if (i % 12 === 0) {
        key.appendChild(
          html`
            <span
              class="${css({
                fontSize: '12px',
                fontFamily: 'sans-serif',
                color: PLAYING_NOTES[i] ? '#fff' : '#bbb'
              })}"
              >C${i / 12 - 2}</span
            >
          `
        )
      }
    } else {
      key = html`
        <div
          id="piano-roll-key-${key}"
          class="${css({
            boxSizing: 'border-box',
            position: 'absolute',
            width: `${BLACK_KEY_WIDTH}px`,
            height: `${BLACK_KEY_HEIGHT}px`,
            backgroundColor: PLAYING_NOTES[i] ? 'tomato' : '#111',
            top: 0,
            left: `${getBlackKeyPositionOffset(i)}px`
          })}"
        ></div>
      `
    }
    key.addEventListener('mousedown', (event) => {
      console.log(event)
      playNote({
        type: 'note_on',
        note: 44,
        velocity: 100,
        channel: 144
      })
      rerender()
    })
    container.appendChild(key)
  }

  return container
}
