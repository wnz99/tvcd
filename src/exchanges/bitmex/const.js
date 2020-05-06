export const WS_ROOT_URL = 'wss://www.bitmex.com/realtime';
export const REST_ROOT_URL = `https://www.bitmex.com/api/v1`;
export const makeCustomApiUrl = (rootUrl) => `${rootUrl}/bitmex/api/v1`;

export const INTERVALS = {
  '1m': '1m',
  '5m': '5m',
  '1h': '1h',
  '1d': '1d',
};

export const API_OPTIONS = {
  apiLimit: 750,
};

export const ERROR = {
  NO_INIT_PAIRS_DEFINED: 'No trading pairs defined.',
  NO_CONFIGURATION_PROVIDED: 'No configuration provided.',
  NO_TIME_FRAME_PROVIDED: 'No interval provided.',
  PAIR_ALREADY_DEFINED: 'Pair already defined.',
  PAIR_NOT_DEFINED: 'Pair not defined.',
  PAIR_IS_NOT_ARRAY: 'Pair must be an array with base ccy and quote ccy.',
  SERVICE_IS_RUNNING: 'The service is already running.',
};
