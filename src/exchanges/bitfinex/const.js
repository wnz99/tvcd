import makeDashPair from './utils/makeDashPair';
import { REAL_TIME } from '../../const';

export const WS_ROOT_URL = 'wss://api-pub.bitfinex.com/ws/2';
export const REST_ROOT_URL = `https://api-pub.bitfinex.com/v2`;
export const makeCustomApiUrl = (rootUrl) => `${rootUrl}/bitfinex/v2`;

// Maps exchange API resolutions to TVCD starndard resolutions
// https://docs.bitfinex.com/reference#rest-public-candles

export const API_RESOLUTIONS_MAP = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '3h': '3h',
  '6h': '6h',
  '12h': '12h',
  '1D': '1D',
  '7D': '7D',
  '14D': '14D',
  '1M': '1M',
  [REAL_TIME]: ['1m', '1m'], // Format: [tvcd_resolution, api_resolution]
};

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
