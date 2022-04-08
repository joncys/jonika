import morph from 'nanomorph'

export type BaseState = object
export type BaseMessage = {type: string}
export type BaseDispatch = (m: BaseMessage) => void
export type BaseEffect = (d: BaseDispatch) => void

export type Component<
  State extends BaseState,
  Message extends BaseMessage,
  Dispatch extends BaseDispatch = (m: Message) => void,
  Effect extends BaseEffect = (d: Dispatch) => void
> = {
  init: [State, Effect?]
  update: (m: Message, s: State) => [State, Effect?]
  view: (s: State, d: Dispatch) => HTMLElement
}

export const mapEffect = <
  Effect extends BaseEffect,
  Message extends BaseMessage
>(
  effect: Effect,
  callback: (m: Message) => Message
) => {
  if (!effect) {
    return effect
  }

  return function _mapEffect(dispatch) {
    function intercept(message) {
      dispatch(callback(message))
    }
    return effect(intercept)
  }
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
