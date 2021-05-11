import { ChannelArgs } from '../../../types';

/**
 * Unsubscribes pair from API ws
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
 * @param  {ChannelArgs} pair
 * @return {void}
 */
const removeTradingPair = (
  sendFn: (msg: string) => void,
  pair: ChannelArgs
): void => {
  const { intervalApi, symbols } = pair;

  const msg = {
    time: new Date().valueOf(),
    channel: 'futures.candlesticks',
    event: 'unsubscribe',
    payload: [intervalApi, `${symbols[0]}${symbols[1]}`],
  };

  sendFn(JSON.stringify(msg));
};

export default removeTradingPair;
