/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { TradingPairs } from '../../../types'
import { WsSubscriptions } from '../types'
import makePair from './makePair'

/**
 * Creates the initial candles subscriptions
 *
 * Example subscription message:
 *
 * {
 *  "id": 1545910660739,                          //The id should be an unique value
 *  "type": "subscribe",
 *  "topic": "/market/candles:BTC-USDT_1day",  //Topic needs to be subscribed. Some topics support to divisional subscribe the informations of multiple trading pairs through ",".
 *  "privateChannel": false,                      //Adopted the private channel or not. Set as false by default.
 *  "response": true                              //Whether the server needs to return the receipt information of this subscription or not. Set as false by default.
 * }
 *
 *
 * @param  {TradingPairs} pairs
 * @return WsSubscriptions
 * */
const makeSubs = (pairs: TradingPairs): WsSubscriptions => {
  let subscriptions: WsSubscriptions = {}

  for (const channel in pairs) {
    const { intervalApi, symbols } = pairs[channel]

    const key = `${intervalApi}:${symbols[0]}:${symbols[1]}`

    subscriptions = {
      ...subscriptions,
      [key]: {
        id: new Date().valueOf(),
        type: `subscribe`,
        topic: `/market/candles:${makePair(symbols)}_${intervalApi}`,
        privateChannel: false,
        response: true,
      },
    }
  }

  return subscriptions
}

export default makeSubs
