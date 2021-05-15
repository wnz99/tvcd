/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { TradingPairs } from '../../../types';
import { WsSubscriptions } from '../types';
import makePair from './makePair';

/**
 * Creates the initial candles subscriptions
 *
 * Example subscription message:
 *
 * {
 *  "time": new Date().valueOf(),
 *  "channel": "spot.candlesticks",
 *  "event": "subscribe",  # "unsubscribe" for unsubscription
 *  "payload": ["1m", "BTC_USDT"]
 * }
 *
 *
 * @param  {TradingPairs} pairs
 * @return WsSubscriptions
 * */
const makeSubs = (pairs: TradingPairs): WsSubscriptions => {
  let subscriptions: WsSubscriptions = {};

  for (const channel in pairs) {
    const { intervalApi, symbols } = pairs[channel];

    const id = new Date().valueOf();

    const key = `${intervalApi}_${symbols[0]}_${symbols[1]}`;

    subscriptions = {
      ...subscriptions,
      [key]: {
        id,
        time: new Date().valueOf(),
        channel: 'spot.candlesticks',
        event: 'subscribe',
        payload: [intervalApi, makePair(symbols[0], symbols[1])],
      },
    };
  }

  return subscriptions;
};

export default makeSubs;
