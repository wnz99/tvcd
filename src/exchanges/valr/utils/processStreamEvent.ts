import { WsEvent } from '../../../utils/ws/types'
import { CandlesStreamData, UpdateData } from '../types'

/**
 * Formats event data and tracks subscribed pairs.
 *
 * Example update event data:
 *
 * ```json
 * {
 * "id": 1234,
 * "time": 1606292600,
 * "channel": "spot.candlesticks",
 * "event": "update",
 * "result": {
 *   "t": "1606292580",
 *   "v": "2362.32035",
 *   "c": "19128.1",
 *   "h": "19128.1",
 *   "l": "19128.1",
 *   "o": "19128.1",
 *   "n": "1m_BTC_USDT"
 *  }
 * }
 * ```
 *
 * Example subscribe event data:
 *
 * ```json
 * {
 * "id": 1234
 * "time": 1606292600,
 * "channel": "spot.candlesticks",
 * "event": "subscribe",
 * "result": {
 *   "status": "success",
 *  }
 * }
 * ```
 *
 * @param  {WsEvent} event
 * @return (null | CandlesStreamData)
 */
const processStreamEvent = (event: WsEvent): undefined | CandlesStreamData => {
  const msg: UpdateData = JSON.parse(event.data)

  if (msg.event === 'update') {
    const [interval, baseSymbol, quoteSymbol] = msg.result.n.split('_')

    const ticker: [string, string] = [baseSymbol, quoteSymbol]

    return [ticker, msg.result, interval]
  }

  return undefined
}

export default processStreamEvent
