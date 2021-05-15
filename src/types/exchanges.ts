import { Subject, Observable } from 'rxjs';

import { WSInstance, WsEvent } from '../utils/ws/types';

export type Intervals = {
  [key: string]: string | [string, string];
  realtime: [string, string];
};

export type TokensSymbols = [string, string];

export type StreamData<T> = [[string, string], T, string];

// export type RealtimeInterval = [string, string];

export type Pair = {
  ticker: string;
  interval: string;
  intervalApi: string;
  symbols: TokensSymbols;
};

export type TradingPairs = {
  [key: string]: Pair;
};

export enum ClientError {
  INTERVAL_NOT_SUPPORTED = 'Interval is not supported',
  NO_CONFIGURATION_PROVIDED = 'No configuration provided.',
  NO_INIT_PAIRS_DEFINED = 'No trading pairs defined.',
  NO_TIME_FRAME_PROVIDED = 'No interval provided.',
  PAIR_ALREADY_DEFINED = 'Pair already defined.',
  PAIR_IS_NOT_ARRAY = 'Pair must be an array with base ccy and quote ccy.',
  PAIR_NOT_DEFINED = 'Pair not defined.',
  SERVICE_IS_RUNNING = 'tdcv is already running.',
}

type ApiResolutionsMap = {
  [key: string]: string | string[];
};

type ExchangeStatus = {
  isRunning: boolean;
  exchange: { name: string };
  debug: boolean;
  wsRootUrl: string;
  restRootUrl: string;
};

export type Candle = {
  time: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
};

export type CandlesData = {
  [key: string]: {
    pair: [string, string];
    interval: string;
    candles: Candle[];
    seq: number;
    meta: {
      isSnapshot: boolean;
      isNewCandle: boolean;
      updateIndex: number | undefined;
      isUpdateCandle: boolean;
    };
  };
};

export type PairConf = {
  interval: string;
};

export type FormatFn<T> = (data: T) => Candle;

export interface Formatter<T> {
  [key: string]: FormatFn<T>;
}

export type Options = { format: 'tradingview' };

export type ClientOptions<T> = { format: (data: T) => Candle };

export interface IExchange<T> {
  options: {
    debug: boolean;
    intervals: ApiResolutionsMap;
  };
  _options: ClientOptions<T>;
  _status: ExchangeStatus;
  _ws: WSInstance | undefined;
  _wsInstance$: Subject<WSInstance>;
  _dataSource$: Observable<WsEvent> | undefined;
  _dataStream$: Subject<CandlesData>;
  _closeStream$: Subject<boolean>;
  _tradingPairs: TradingPairs;
  _candlesData: CandlesData;
  start: (options?: Options) => unknown;
  stop: () => void;
  fetchCandles: (
    pair: TokensSymbols,
    interval: string,
    start: number,
    end: number,
    limit: number
  ) => Promise<unknown>;
  getTradingPairs: () => TradingPairs;
  getStatus: () => ExchangeStatus;
  setDebug: () => void;
  setApiUrl: (apiUrl: string) => void;
  addTradingPair: (
    pair: TokensSymbols,
    pairConf: PairConf
  ) => string | undefined;
  removeTradingPair: (
    pair: TokensSymbols,
    intervalApi: string
  ) => string | undefined;
  _resetConf: () => void;
}
