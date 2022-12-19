import { StreamData } from '../../types'

type CandlesSubscription = {
  id: number
  time: number
  channel: string
  event: string
  payload: [string, string]
}

export type WsSubscriptions = {
  [key: number]: CandlesSubscription
}

export type PongData = {
  time: number
  channel: 'spot.pong'
  event: ''
  error: unknown
  result: unknown
}

export type UpdateData = {
  id: number
  time: number
  channel: 'spot.candlesticks'
  event: 'update'
  result: {
    t: string
    v: string
    c: string
    h: string
    l: string
    o: string
    n: string
  }
}

export type CandlesStreamData = StreamData<UpdateData['result']>

export type DataStream = {
  data: string
}

export type RestApiCandle = {
  bucketPeriodInSeconds: number
  close: string
  currencyPairSymbol: string
  high: string
  low: string
  open: string
  quoteVolume: string
  startTime: string
  volume: string
}

export type ValrCandle = RestApiCandle
