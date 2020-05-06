export const WS_ROOT_URL = '';
export const REST_ROOT_URL = `https://poloniex.com/public`;
export const makeCustomApiUrl = () => `https://poloniex.com/public`;

export const INTERVALS = {
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '2h': '2h',
  '4h': '4h',
  '24h': '24h',
};

export const API_OPTIONS = {
  apiLimit: 750,
};

export const INTERVAL_CONVERSION = {
  '300': '5m',
  '900': '15m',
  '1800': '30m',
  '7200': '2h',
  '14400': '4h',
  '86400': '24h',
  '5m': '300',
  '15m': '900',
  '30m': '1800',
  '2h': '7200',
  '4h': '14400',
  '24h': '86400',
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
