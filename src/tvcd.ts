/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as exchanges from './exchanges';
import { IExchange } from './types';

type Exchanges =
  | 'binance'
  | 'binanceCoinFutures'
  | 'binanceUsdFutures'
  | 'bitfinex'
  | 'bitmex'
  | 'bittrex'
  | 'deversifi'
  | 'gateio'
  | 'kucoin'
  | 'poloniex'
  | 'valr';

let instance: IExchange<
  | exchanges.BinanceCandle
  | exchanges.GateIoCandle
  | exchanges.KucoinCandle
  | exchanges.ValrCandle
  | exchanges.BitfinexCandle
>;

let selectedExchange: Exchanges;

const tvcd = (
  exchange: Exchanges
): IExchange<
  | exchanges.BinanceCandle
  | exchanges.GateIoCandle
  | exchanges.KucoinCandle
  | exchanges.ValrCandle
  | exchanges.DeversifiCandle
> =>
  (() => {
    // @ts-ignore
    if (!exchanges[exchange]) {
      throw new Error(`${exchange} not supported`);
    }

    if (!instance || selectedExchange !== exchange) {
      // @ts-ignore
      instance = exchanges[exchange];

      selectedExchange = exchange;

      return instance;
    }
    return instance;
  })();

export default tvcd;
