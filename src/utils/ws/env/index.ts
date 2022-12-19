import * as ENV_DEV from './config.dev'
import * as ENV_PROD from './config.prod'

const PROD = true

const conf = PROD ? ENV_PROD : ENV_DEV

export default conf
