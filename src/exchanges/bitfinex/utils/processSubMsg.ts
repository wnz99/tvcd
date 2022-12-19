import _findKey from 'lodash/findKey'

import { TradingPairs } from '../../../types/exchanges'
import { WsEvent } from '../../../utils/ws/types'
import { SubscribeData } from '../types'

/**
 * Tracks trading pair subscriptions. 
 * 
 * Example subscribed event data:
 * 
 * ```
 {
    event: "subscribed",
    channel: "candles",
    chanId: CHANNEL_ID,
    key: "trade:1m:tBTCUSD"
 }
 * ```
 * @param  {WsEvent} event 
 * @param  {TradingPairs} tradingPairs 
 * @return (CandlesStreamData | undefined) 
 */

const processSubMsg = (
  event: WsEvent,
  tradingPairs: TradingPairs
): TradingPairs => {
  const msg: SubscribeData = JSON.parse(event.data)

  if (msg.event === 'subscribed') {
    const [, interval, ...rest] = msg.key.split(':')

    const key = _findKey(
      tradingPairs,
      (item) =>
        // eslint-disable-next-line operator-linebreak
        item.symbols.join('') === rest.join('').substr(1) &&
        item.intervalApi === interval
    )

    if (key) {
      return {
        ...tradingPairs,
        [key]: {
          ...tradingPairs[key],
          ws: { ...tradingPairs[key].ws, meta: { chanId: msg.chanId } },
        },
      }
    }
  }

  return tradingPairs
}

export default processSubMsg
