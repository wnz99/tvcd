import { Pair } from '../../../types';
import { WSInstance } from '../../../utils/ws/types';

/**
 * Unsubscribes pair from API ws.
 *
 * Example unsubscribe message:
 *
 * ```json
 * {
 * "time" : 123456,
 * "channel" : "futures.candlesticks",
 * "event": "unsubscribe",
 * "payload" : ["1m", "BTC_USD"]
 * }
 * ```
 *
 * @param  {(msg: string) => void} sendFn
 * @param  {Pair} pair
 * @return {void}
 */
const removeTradingPair = (ws: WSInstance, pair: Pair): void => {
  const { intervalApi, symbols } = pair;

  const msg = {
    time: new Date().valueOf(),
    channel: 'futures.candlesticks',
    event: 'unsubscribe',
    payload: [intervalApi, `${symbols[0]}${symbols[1]}`],
  };

  ws.send(JSON.stringify(msg));

  const key = `${intervalApi}:${symbols[0]}:${symbols[1]}`;

  ws.deleteSubscription(key);
};

export default removeTradingPair;
