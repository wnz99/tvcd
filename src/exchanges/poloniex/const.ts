import { REAL_TIME } from '../../const';
import { Intervals } from '../../types';

export const WS_ROOT_URL = '';
export const REST_ROOT_URL = `https://poloniex.com/public`;
// Maps TVCD standard resolutions to exchange API resolutions

const LIVE = '300';

export const API_RESOLUTIONS_MAP: Intervals = {
  '5m': LIVE,
  '15m': '900',
  '30m': '1800',
  '2h': '7200',
  '4h': '14400',
  '24h': '86400',
  '1D': '86400',
  [REAL_TIME]: ['5m', LIVE], // Format: [tvcd_resolution, api_resolution]
};

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
};
