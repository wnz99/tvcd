import { REAL_TIME } from '../../const';

export const WS_ROOT_URL = ' wss://stream.binance.com:9443';
export const REST_ROOT_URL = `https://api.binance.com/api/v1`;
export const makeCustomApiUrl = (rootUrl) => `${rootUrl}/binance/api/v1`;

// Maps TVCD standard resolutions to exchange API resolutions
// https://binance-docs.github.io/apidocs/spot/en/#public-api-definitions

export const API_RESOLUTIONS_MAP = {
  '1m': '1m',
  '3m': '3m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '2h': '2h',
  '3h': '3h',
  '4h': '4h',
  '6h': '6h',
  '8h': '8h',
  '12h': '12h',
  '1D': '1d',
  '3D': '3d',
  '1W': '1w',
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
