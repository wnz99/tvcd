import { REAL_TIME } from '../../const';

export const REST_ROOT_URL = `https://global.bittrex.com/Api/v2.0/pub`;
export const makeCustomApiUrl = (rootUrl) => `${rootUrl}/bittrex/Api/v2.0/pub`;

export const API_RESOLUTIONS_MAP = {
  '1m': '1m',
  '5m': '5m',
  '10m': '10m',
  '30m': '30m',
  '1h': '1h',
  '4h': '4h',
  '1D': '1D',
  '7D': '7D',
  '30D': '30D',
  [REAL_TIME]: ['1m', '1m'], // Format: [tvcd_resolution, api_resolution]
};

export const INTERVALS_CONVERSION = {
  '1m': 'oneMin',
  '5m': 'fiveMin',
  '30m': 'thirtyMin',
  '1h': 'hour',
  '1D': 'day',
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
