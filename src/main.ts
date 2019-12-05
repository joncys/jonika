import morph from 'nanomorph'
import html from 'nanohtml'

import {css} from './html'

const app = document.querySelector('.app--inner')
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
app.appendChild(start)
start.querySelector('button').addEventListener('click', event => {
  ctx = new AudioCtx()
})

const piano = generatePianoRoll()
app.appendChild(piano)

function rerender() {
  morph(piano, generatePianoRoll())
}

navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)

function onMIDISuccess(midiAccess: WebMidi.MIDIAccess) {
  var inputs = midiAccess.inputs
  var outputs = midiAccess.outputs

  Array.from(midiAccess.inputs.values()).forEach(input => {
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
    const hz = midiNoteToHz(midi.note)
    osc.frequency.value = hz
    osc.connect(ctx.destination)
    osc.start()
    PLAYING_NOTES[midi.note] = osc
  }
}

function stopNote(midi: ReturnType<typeof parseMidi>) {
  if (ctx) {
    const osc = PLAYING_NOTES[midi.note]
    PLAYING_NOTES[midi.note] = undefined
    osc.stop(ctx.currentTime)
  }
}

function stopAll() {
  if (ctx) {
    Object.keys(PLAYING_NOTES).forEach(note => {
      const osc = PLAYING_NOTES[note]
      osc.stop(ctx.currentTime)
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
              >C${i / 12 - 1}</span
            >
          `
        )
      }
      container.appendChild(key)
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
      container.appendChild(key)
    }
  }

  return container
}
