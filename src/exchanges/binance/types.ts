import { StreamData } from '../../types'

export type CandlesSubscription = {
  method: 'SUBSCRIBE' | 'UNSUBSCRIBE'
  params: string[]
  id?: number
}

export type WsSubscription = {
  [key: string]: CandlesSubscription
}

export type PongData = {
  id: string
  type: 'pong'
}

export type UpdateData = {
  stream: string
  data: {
    e: string // Event type
    E: number // Event time
    s: string // Symbol
    k: {
      t: number // Kline start time
      T: number // Kline close time
      s: string // Symbol
      i: string // Interval
      f: number // First trade ID
      L: number // Last trade ID
      o: string // Open price
      c: string // Close price
      h: string // High price
      l: string // Low price
      v: string // Base asset volume
      n: number // Number of trades
      x: boolean // Is this kline closed?
      q: string // Quote asset volume
      V: string // Taker buy base asset volume
      Q: string // Taker buy quote asset volume
      B: string // Ignore
    }
  }
}

export type CandlesStreamData = StreamData<UpdateData['data']['k']>

export type DataStream = {
  data: string
}

export type WsApiCandle = {
  t: number // Kline start time
  T: number // Kline close time
  s: string // Symbol
  i: string // Interval
  f: number // First trade ID
  L: number // Last trade ID
  o: string // Open price
  c: string // Close price
  h: string // High price
  l: string // Low price
  v: string // Base asset volume
  n: number // Number of trades
  x: boolean // Is this kline closed?
  q: string // Quote asset volume
  V: string // Taker buy base asset volume
  Q: string // Taker buy quote asset volume
  B: string // Ignore
}

export type RestApiCandle = [
  number, // Open time
  string, // Open
  string, // High
  string, // Low
  string, // Close
  string, // Volume
  number, // Close time
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base asset volume
  string, // Taker buy quote asset volume
  string // Ignore.
]

export type BinanceCandle = WsApiCandle | RestApiCandle
