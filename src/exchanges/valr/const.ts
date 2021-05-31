import { REAL_TIME } from '../../const';
import { Intervals } from '../../types';

export const WS_ROOT_URL = 'wss://api.valr.com/ws/v4/';
export const REST_ROOT_URL = `https://api.valr.com`;
export const makeCustomApiUrl = (rootUrl: string): string => `${rootUrl}/valr`;

// Maps TVCD standard resolutions to exchange API resolutions
// https://www.gate.io/docs/apiv4/ws/index.html#client-subscription-3

export const API_RESOLUTIONS_MAP: Intervals = {
  '1m': '60',
  '5m': '300',
  '15m': '900',
  '30m': '1800',
  '1h': '3600',
  '6h': '21600',
  '1D': '86400',
  [REAL_TIME]: ['1m', '60'], // Format: [tvcd_resolution, api_resolution]
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
