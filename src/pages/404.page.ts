import {ViewFunction} from '../main'
import html from 'nanohtml'
import {css} from '../html'

export const view: ViewFunction = () => {
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
