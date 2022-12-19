import { REAL_TIME } from '../../const'
import { Intervals } from '../../types'

export const WS_ROOT_URL = 'wss://api.gateio.ws/ws/v4/'
export const REST_ROOT_URL = `https://api.kucoin.com/api/v1`
export const makeCustomApiUrl = (rootUrl: string): string =>
  `${rootUrl}/kucoin/api/v1`

// Maps TVCD standard resolutions to exchange API resolutions
// https://docs.kucoin.com/#get-klines

export const API_RESOLUTIONS_MAP: Intervals = {
  '1m': '1min',
  '3m': '3min',
  '5m': '5min',
  '15m': '15min',
  '30m': '30min',
  '1h': '1hour',
  '2h': '2hour',
  '4h': '4hour',
  '6h': '6hour',
  '8h': '8hour',
  '12h': '12hour',
  '1D': '1day',
  '1W': '1week',
  [REAL_TIME]: ['1m', '1min'], // Format: [tvcd_resolution, api_resolution]
}

// Maps exchange API resolutions to TVCD standard resolutions

export const TVCV_RESOLUTIONS_MAP = {
  '10': '10',
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '4h': '4h',
  '8h': '8h',
  '1d': '1D',
  '7d': '7D',
  [REAL_TIME]: ['10', '10'], // Format: [tvcd_resolution, api_resolution]
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
