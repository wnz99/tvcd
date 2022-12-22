import { StreamData } from '../../types'
import { TokensSymbols } from './../../types/exchanges'

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

export type WsApiCandle = [
  number, // time
  number, // Open
  number, // Close
  number, // High
  number, // Low
  number // Volume
]

export type RestApiCandle = {
  timestamp: number
  open: number
  close: number
  high: number
  low: number
  volume: number
}

export type SubscribeData = {
  event: 'subscribed' | 'unsubscribed'
  channel: string
  chanId: number
  key: string
  status?: 'OK'
}

export type UpdateData = [number, WsApiCandle | WsApiCandle[] | 'hb']

export type CandlesStreamData = StreamData<UpdateData[1]>

export type DataStream = {
  data: string
}

export type DeribitCandle = RestApiCandle

export type DeribitInstrument = TokensSymbols
