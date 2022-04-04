import {Client} from 'styletron-engine-atomic'
import {StyleObject} from 'styletron-standard'
import {theme, Theme} from './theme'

const instance = new Client({prefix: 'jonika-'})

export function css(styles: StyleObject | (($theme: Theme) => StyleObject)) {
  if (typeof styles === 'function') {
    return instance.renderStyle(styles(theme))
  }

  return instance.renderStyle(styles)
}
