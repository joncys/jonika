import {runtime} from './runtime'

import {Create} from './Create'

const container = document.querySelector('.app') as HTMLDivElement

runtime(Create, container)
