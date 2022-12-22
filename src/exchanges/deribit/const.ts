import { REAL_TIME } from '../../const'
import { Intervals } from '../../types'

export const WS_ROOT_URL = 'wss://www.deribit.com/ws/api/v2'
export const REST_ROOT_URL = `https://www.deribit.com/api/v2`
// Maps TVCD standard resolutions to exchange API resolutions

export const API_RESOLUTIONS_MAP: Intervals = {
  '1m': '1',
  '3m': '3',
  '5m': '5',
  '10m': '10',
  '15m': '15',
  '30m': '30',
  '1h': '60',
  '2h': '120',
  '3h': '180',
  '6h': '360',
  '12h': '720',
  '1D': '1D',
  [REAL_TIME]: ['1m', '1'], // Format: [tvcd_resolution, api_resolution]
}

// Maps exchange API resolutions to TVCD standard resolutions

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
