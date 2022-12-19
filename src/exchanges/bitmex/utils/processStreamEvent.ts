import _pickBy from 'lodash/pickBy'

import { TradingPairs } from '../../../types/exchanges'
import { WsEvent } from '../../../utils/ws/types'
import { CandlesStreamData, UpdateData } from '../types'

const processStreamEvent = (
  event: WsEvent,
  tradingPairs: TradingPairs
): CandlesStreamData | undefined => {
  try {
    const msg: UpdateData = JSON.parse(event.data)

    const { data, table } = msg

    const interval = table.replace('tradeBin', '')

    const { timestamp, open, high, low, close, volume, symbol } = data[0]

    const pair = _pickBy(
      tradingPairs,
      (item) =>
        item.symbols.join('') === symbol && item.intervalApi === interval
    )

    if (Object.keys(pair).length !== 0) {
      const candleData = { timestamp, open, close, high, low, volume }

      return [Object.values(pair)[0].symbols, candleData, interval]
    }

    return undefined
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e)
  }
  return undefined
}

export default processStreamEvent
