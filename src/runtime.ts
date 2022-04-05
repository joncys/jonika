import morph from 'nanomorph'

export type BaseMessage = {type: string}
export type Component<
  State extends object,
  Message extends BaseMessage,
  Dispatch extends (m: Message) => void = (m: Message) => void,
  Effect extends (d: Dispatch) => void = (d: Dispatch) => void
> = {
  init: [State, Effect?]
  update: (m: Message, s: State) => [State, Effect?]
  view: (s: State, d: Dispatch) => HTMLElement
}

// This is nicked from https://github.com/andrejewski/raj
export const runtime = <State extends object, Message extends {type: string}>(
  component: Component<State, Message>,
  mountNode: HTMLElement
) => {
  type Tuple = typeof component.init

  let currentState: State
  let element

  const {init, update, view} = component

  const dispatch = (message: Message) => {
    change(update(message, currentState))
  }

  const change = (tuple: Tuple) => {
    currentState = tuple[0]

    const effect = tuple[1]
    if (effect) {
      effect(dispatch)
    }

    if (element) {
      morph(element, view(currentState, dispatch))
    } else {
      element = view(currentState, dispatch)
      mountNode.appendChild(element)
    }
  }

  change(init)
}
