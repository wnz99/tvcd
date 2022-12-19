import { REAL_TIME } from '../../const'
import { Intervals } from '../../types'

export const WS_ROOT_URL = ''
export const REST_ROOT_URL = `https://global.bittrex.com/Api/v2.0/pub`

// Maps TVCD standard resolutions to exchange API resolutions

const LIVE = 'oneMin'

export const API_RESOLUTIONS_MAP: Intervals = {
  '1m': LIVE,
  '5m': 'fiveMin',
  '30m': 'thirtyMin',
  '1h': 'hour',
  '1D': 'day',
  [REAL_TIME]: ['1m', LIVE], // Format: [tvcd_resolution, api_resolution]
}

export const INTERVALS_CONVERSION = {
  '1m': 'oneMin',
  '5m': 'fiveMin',
  '30m': 'thirtyMin',
  '1h': 'hour',
  '1D': 'day',
}
