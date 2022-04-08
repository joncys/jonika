import {css} from './html'
import html from 'nanohtml'
import {Component, mapEffect} from './runtime'
import {Create, State as CreateState, Message as CreateMessage} from './Create'

type Page = 'index' | 'create'
type State = {
  page: Page
  create: CreateState
}

const messages = {
  // todo: any
  createMessage(data: any) {
    return {type: 'create_message', data} as const
  },
  changePage(newPage: Page) {
    return {type: 'change_page', newPage} as const
  }
}

type Message =
  | ReturnType<typeof messages[keyof typeof messages]>
  | CreateMessage

const [createState, createEffect] = Create.init
// todo: any
const init: [State, any] = [
  {
    page: 'index',
    create: createState
  },
  mapEffect(createEffect, messages.createMessage)
]

export const App: Component<State, Message> = {
  init,
  update(message, state) {
    switch (message.type) {
      case 'change_page':
        return [{...state, page: message.newPage}]
      case 'create_message': {
        const [newCreateState, createEffect] = Create.update(
          message.data,
          state.create
        )
        const newState = {...state, create: newCreateState}
        return [newState, mapEffect(createEffect, messages.createMessage)]
      }
      default:
        return [state]
    }
  },
  view(state, dispatch) {
    switch (state.page) {
      case 'index':
        return landing(dispatch)
      case 'create':
        return Create.view(state.create, dispatch)
      default:
        return not_found()
    }
  }
}

const landing = (dispatch) => {
  return html`<div
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
        dispatch(messages.changePage('create'))
      }}"
    >
      Start here
    </button>
  </div>`
}

const not_found = () => {
  return html`<div
    className="${css({
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    })}"
  >
    <h1
      className="${css((theme) => ({
        fontSize: '8rem',
        color: theme.colors.tertiary
      }))}"
    >
      404
    </h1>
    <p
      className="${css((theme) => ({
        color: theme.colors.textTertiary
      }))}"
    >
      This page does not exist. You can always
      <a
        href="/"
        className="${css((theme) => ({
          color: theme.colors.textTertiary,
          ':hover': {
            color: theme.colors.primary
          }
        }))}"
        >go back</a
      >.
    </p>
  </div>`
}
