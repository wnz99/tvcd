import { Pair } from '../../../types'
import { WSInstance } from '../../../utils/ws/types'

/**
 * Unsubscribes pair from API ws.
 *
 * Example unsubscribe message:
 *
 * ```json
 * {
 *   "id": "1545910840805",                            //The id should be an unique value
 *   "type": "unsubscribe",
 *   "topic": "/market/candles:BTC-USDT_1day",      //Topic needs to be unsubscribed. Some topics support to divisional unsubscribe the informations of multiple trading pairs through ",".
 *   "privateChannel": false,
 *   "response": true                                  //Whether the server needs to return the receipt information of this subscription or not. Set as false by default.
 * }
 * ```
 *
 * @param  {(msg: string) => void} sendFn
 * @param  {Pair} pair
 * @return {void}
 */
const removeTradingPair = (ws: WSInstance, pair: Pair): void => {
  const { intervalApi, symbols } = pair

  const msg = {
    id: new Date().valueOf(),
    type: `unsubscribe`,
    topic: `/market/candles:${symbols[0]}-${symbols[1]}_${intervalApi}`,
    privateChannel: false,
    response: true,
  }

  ws.send(JSON.stringify(msg))

  const key = `${intervalApi}:${symbols[0]}:${symbols[1]}`

  ws.deleteSubscription(key)
}

export default removeTradingPair
