import {Client} from 'styletron-engine-atomic'
import {StyleObject} from 'styletron-standard'

const instance = new Client({prefix: 'jonika-'})

export function css(styles: StyleObject) {
  return instance.renderStyle(styles)
}
