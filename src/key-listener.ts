export const createKeyListener = (window: Window) => {
  type Handler = (event: KeyboardEvent) => void
  const pressedKeys: {[key: KeyboardEvent['key']]: boolean} = {}
  const handlers: {up: Handler[]; down: Handler[]} = {up: [], down: []}
  const keyDown: Handler = (event) => {
    if (pressedKeys[event.key]) return
    pressedKeys[event.key] = true
    handlers.down.forEach((handler) => handler(event))
  }
  const keyUp: Handler = (event) => {
    delete pressedKeys[event.key]
    handlers.up.forEach((handler) => handler(event))
  }

  window.addEventListener('keydown', keyDown)
  window.addEventListener('keyup', keyUp)

  return {
    addKeyDownHandler(h: Handler) {
      handlers.down.push(h)
      return () => handlers.down.filter((handler) => handler !== h)
    },
    addKeyUpHandler(h: Handler) {
      handlers.up.push(h)
      return () => handlers.up.filter((handler) => handler !== h)
    },
    destroy() {
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
    }
  }
}
