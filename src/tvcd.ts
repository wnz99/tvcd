/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as exchanges from './exchanges';
import { Exchanges } from './types';

let instance:
  | exchanges.IBinance
  | exchanges.IBitfinex
  | exchanges.IBitmex
  | exchanges.IBittrex
  | exchanges.IDeversifi
  | exchanges.IGateIo
  | exchanges.IKucoin
  | exchanges.IPoloniex
  | exchanges.IValr;

let selectedExchange: Exchanges;

const tvcd = (exchange: Exchanges) =>
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
