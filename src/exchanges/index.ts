import Binance from './binance'
import Bitfinex from './bitfinex'
import Bitmex from './bitmex'
import Bittrex from './bittrex'
import Deversifi from './deversifi'
import Ftx from './ftx'
import GateIo from './gateIo'
import Kucoin from './kucoin'
import Poloniex from './poloniex'
import Valr from './valr'

export type IBinance = Binance
export type IBitfinex = Bitfinex
export type IBitmex = Bitmex
export type IBittrex = Bittrex
export type IDeversifi = Deversifi
export type IGateIo = GateIo
export type IKucoin = Kucoin
export type IPoloniex = Poloniex
export type IValr = Valr

export type BinanceCandle = import('./binance/types').BinanceCandle
export type BitfinexCandle = import('./bitfinex/types').BitfinexCandle
export type BitmexCandle = import('./bitmex/types').BitmexCandle
export type BittrexCandle = import('./bittrex/types').BittrexCandle
export type DeversifiCandle = import('./deversifi/types').DeversifiCandle
export type FtxCandle = import('./ftx/types').FtxCandle
export type GateIoCandle = import('./gateIo/types').GateIoCandle
export type KucoinCandle = import('./kucoin/types').KucoinCandle
export type PoloniexCandle = import('./poloniex/types').PoloniexCandle
export type ValrCandle = import('./valr/types').ValrCandle

export const binance = new Binance({ dataSet: 'spot' })
export const binancefuturescoin = new Binance({ dataSet: 'coinFutures' })
export const binancefuturesusd = new Binance({ dataSet: 'usdFutures' })
export const bitfinex = new Bitfinex()
export const bitmex = new Bitmex()
export const bittrex = new Bittrex()
export const deversifi = new Deversifi()
export const ftx = new Ftx()
export const gateio = new GateIo()
export const kucoin = new Kucoin()
export const poloniex = new Poloniex()
export const valr = new Valr()
