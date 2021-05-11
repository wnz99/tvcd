import { REAL_TIME } from '../../const';
import { Intervarls } from '../../types';

export const WS_ROOT_URL = 'wss://api.gateio.ws/ws/v4/';
export const REST_ROOT_URL = `https://api.gateio.ws/api/v4`;
export const makeCustomApiUrl = (rootUrl: string): string =>
  `${rootUrl}/gateio/api/v4`;

// Maps TVCD standard resolutions to exchange API resolutions
// https://www.gate.io/docs/apiv4/ws/index.html#client-subscription-3

export const API_RESOLUTIONS_MAP: Intervarls = {
  '10': '10',
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '4h': '4h',
  '8h': '8h',
  '1D': '1d',
  '7D': '7d',
  [REAL_TIME]: ['10', '10'], // Format: [tvcd_resolution, api_resolution]
};

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
