import { StreamData } from '../../types'

export type WsApiCandle = {
  timestamp: number
  open: number
  close: number
  high: number
  low: number
  volume: number
  symbol?: string
}

export type RestApiCandle = {
  timestamp: number
  open: number
  close: number
  high: number
  low: number
  volume: number
}

export type UpdateData = {
  table: string
  action: string
  data: WsApiCandle[]
}

export type CandlesStreamData = StreamData<WsApiCandle>

export type DataStream = {
  data: string
}

export type BitmexCandle = WsApiCandle | RestApiCandle
