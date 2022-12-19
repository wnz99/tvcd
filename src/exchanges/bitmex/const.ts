import { REAL_TIME } from '../../const'
import { Intervals } from '../../types'

export const WS_ROOT_URL = 'wss://www.bitmex.com/realtime'
export const REST_ROOT_URL = `https://www.bitmex.com/api/v1`
export const REST_ROOT_URL_UDF = 'https://www.bitmex.com/api/udf'

// Maps TVCD standard resolutions to exchange API resolutions
// https://www.bitmex.com/api/explorer/#!/Trade/Trade_getBucketed

const LIVE = '1m'

export const API_RESOLUTIONS_MAP: Intervals = {
  '1m': LIVE,
  '5m': '5m',
  '1h': '1h',
  '1D': '1d',
  [REAL_TIME]: ['1m', LIVE], // Format: [tvcd_resolution, api_resolution]
}

const LIVE_UDF = '1m'

export const API_RESOLUTIONS_MAP_UDF: Intervals = {
  '1m': LIVE_UDF,
  '5m': '5',
  '1h': '60',
  '1D': 'D',
  [REAL_TIME]: ['1m', LIVE_UDF], // Format: [tvcd_resolution, api_resolution]
}

export const API_OPTIONS = {
  apiLimit: 999,
}

export const ERROR = {
  INTERVAL_NOT_SUPPORTED: 'Interval is not supported',
  NO_CONFIGURATION_PROVIDED: 'No configuration provided.',
  NO_INIT_PAIRS_DEFINED: 'No trading pairs defined.',
  NO_TIME_FRAME_PROVIDED: 'No interval provided.',
  PAIR_ALREADY_DEFINED: 'Pair already defined.',
  PAIR_IS_NOT_ARRAY: 'Pair must be an array with base ccy and quote ccy.',
  PAIR_NOT_DEFINED: 'Pair not defined.',
  SERVICE_IS_RUNNING: 'tdcv is already running.',
}
