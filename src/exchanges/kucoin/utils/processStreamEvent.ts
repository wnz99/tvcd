import { WsEvent } from '../../../utils/ws/types'
import { CandlesStreamData, UpdateData } from '../types'

/**
 * Formats event data and tracks subscribed pairs.
 *
 * Example update event data:
 *
 * ```json
{
    "type":"message",
    "topic":"/market/candles:BTC-USDT_1hour",
    "subject":"trade.candles.update",
    "data":{

        "symbol":"BTC-USDT",    // symbol
        "candles":[

            "1589968800",   // Start time of the candle cycle
            "9786.9",       // open price
            "9740.8",       // close price
            "9806.1",       // high price
            "9732",         // low price
            "27.45649579",  // Transaction volume
            "268280.09830877"   // Transaction amount
        ],
        "time":1589970010253893337  // now（us）
    }
}
 * ```
 *
 *
 * @param  {WsEvent} event
 * @return (null | CandlesStreamData)
 */
const processStreamEvent = (event: WsEvent): undefined | CandlesStreamData => {
  const msg: UpdateData = JSON.parse(event.data)

  if (msg.subject === 'trade.candles.update') {
    const [pair, interval] = msg.topic
      .replace('/market/candles:', '')
      .split('_')

    const ticker = pair.split('-') as [string, string]

    return [ticker, msg.data.candles, interval]
  }

  return undefined
}

export default processStreamEvent
