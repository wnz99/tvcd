/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as exchanges from './exchanges'
import { SupportedExchanges } from './types'

let instance:
  | exchanges.IBinance
  | exchanges.IBitfinex
  | exchanges.IBitmex
  | exchanges.IBittrex
  | exchanges.IDeversifi
  | exchanges.IGateIo
  | exchanges.IKucoin
  | exchanges.IPoloniex
  | exchanges.IValr
  | exchanges.IDeribit

let selectedExchange: SupportedExchanges

const tvcd = (exchange: SupportedExchanges) =>
  (() => {
    if (!exchanges[exchange]) {
      throw new Error(`${exchange} not supported`)
    }

    if (!instance || selectedExchange !== exchange) {
      instance = exchanges[exchange]

      selectedExchange = exchange

      return instance
    }
    return instance
  })()

export default tvcd
