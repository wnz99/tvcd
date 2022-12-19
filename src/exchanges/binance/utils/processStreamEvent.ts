import _pickBy from 'lodash/pickBy'

import { TradingPairs } from '../../../types/exchanges'
import { WsEvent } from '../../../utils/ws/types'
import { CandlesStreamData, UpdateData } from '../types'

/**
 * Formats event data and tracks subscribed pairs. 
 * 
 * Example event data:
 * 
 * ```json
{
  "e": "kline",     // Event type
  "E": 123456789,   // Event time
  "s": "BNBBTC",    // Symbol
  "k": {
    "t": 123400000, // Kline start time
    "T": 123460000, // Kline close time
    "s": "BNBBTC",  // Symbol
    "i": "1m",      // Interval
    "f": 100,       // First trade ID
    "L": 200,       // Last trade ID
    "o": "0.0010",  // Open price
    "c": "0.0020",  // Close price
    "h": "0.0025",  // High price
    "l": "0.0015",  // Low price
    "v": "1000",    // Base asset volume
    "n": 100,       // Number of trades
    "x": false,     // Is this kline closed?
    "q": "1.0000",  // Quote asset volume
    "V": "500",     // Taker buy base asset volume
    "Q": "0.500",   // Taker buy quote asset volume
    "B": "123456"   // Ignore
  }
}
 * ```
 * 
 * @param  {WsEvent} event 
 * @param  {TradingPairs} tradingPairs 
 * @return (undefined | CandlesStreamDat) 
 */
const processStreamEvent = (
  event: WsEvent,
  tradingPairs: TradingPairs
): CandlesStreamData | undefined => {
  const msg: UpdateData = JSON.parse(event.data)

  if (msg && msg.data && msg.data.k) {
    const ticker = msg.data.s

    const interval = msg.data.k.i

    const pair = _pickBy(
      tradingPairs,
      (item) =>
        item.symbols.join('') === ticker && item.intervalApi === interval
    )

    return [Object.values(pair)[0].symbols, msg.data.k, interval]
  }

  return undefined
}

export default processStreamEvent
