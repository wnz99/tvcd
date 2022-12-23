import { Observable, Subscription } from 'rxjs'

import { WsEvent } from '../utils/ws/types'

export enum Exchanges {
  'binance' = 'binance',
  'binancefuturescoin' = 'binancefuturescoin',
  'binancefuturesusd' = 'binancefuturesusd',
  'bitfinex' = 'bitfinex',
  'bitmex' = 'bitmex',
  'bittrex' = 'bittrex',
  'deversifi' = 'deversifi',
  'gateio' = 'gateio',
  'kucoin' = 'kucoin',
  'poloniex' = 'poloniex',
  'valr' = 'valr',
  'ftx' = 'ftx',
  'deribit' = 'deribit',
}

export type Intervals = {
  [key: string]: string | [string, string]
  realtime: [string, string]
}

export type TokensSymbols = [string, string]

export type Interval = string

export type StreamData<T> = [[string, string], T, Interval]

export type PublicOptions = {
  intervals: Intervals
  intervalsUdf?: Intervals
}

export type Status = {
  isRunning: boolean
  isDebug: boolean
}

export type WsConf = {
  makeWsMsg: (
    messageType: string,
    pair: Pair
  ) => { [key: string]: unknown } | string | undefined
}

export type MakeCustomApiUrl = (rootUrl: string, isUdf?: boolean) => string

export type ExchangeConf = {
  isDebug?: boolean
  exchangeName: Exchanges
  wsRootUrl: string
  restRootUrl: string
  apiResolutionsMap: Intervals
  apiResolutionsUdfMap?: Intervals
  makeCustomApiUrl: MakeCustomApiUrl
  wsConf?: WsConf
  isUdf?: boolean
  apiLimit?: number
}

export type Pair = {
  ticker: string
  interval: string
  intervalApi: string
  symbols: TokensSymbols
  ws?: {
    subMsg?: { [key: string]: unknown } | string
    unsubMsg?: { [key: string]: unknown } | string
    meta?: { [key: string]: unknown }
  }
}

export type TradingPairs = {
  [key: string]: Pair
}

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

export type Candle = {
  time: number
  open: number
  close: number
  high: number
  low: number
  volume: number
}

export type CandlesData = {
  [key: string]: {
    pair: [string, string]
    interval: string
    candles: Candle[]
    seq: number
    meta: {
      isSnapshot: boolean
      isNewCandle: boolean
      updateIndex: number | undefined
      isUpdateCandle: boolean
    }
  }
}

export type PairConf = {
  interval: string
}

export type FormatFn<T> = (data: T) => Candle

export type ProcessUdfDataFn<T> = (data: any) => T[]

export interface Formatter<T> {
  [key: string]: FormatFn<T>
}

export type Options = { format: 'tradingview' }

export type ClientOptions<T> = { format: (data: T) => Candle }

export type CandleSubscription = Subscription

export type CandlesStream = Observable<CandlesData>

export interface IExchange<T = any> {
  options: {
    intervals: Intervals
    intervalsUdf?: Intervals
  }
  _options: ClientOptions<T>
  _dataSource$?: Observable<WsEvent> | undefined
  start: (options?: Options) => undefined | string
  stop: () => void
  fetchCandles: (
    pair: TokensSymbols,
    interval: string,
    start: number,
    end: number,
    opt?: { [key: string]: string | number | undefined | boolean }
  ) => Promise<Candle[]>
  getTradingPairs: () => TradingPairs
  getStatus: () => Status
  setDebug: (status: boolean) => void
  setApiUrl: (apiUrl: string, isUdf?: boolean) => void
  addTradingPair: (
    pair: TokensSymbols,
    pairConf: PairConf
  ) => string | undefined
  removeTradingPair: (
    pair: TokensSymbols,
    intervalApi: string
  ) => string | undefined
  data$: (channels?: string[]) => CandlesStream
}
