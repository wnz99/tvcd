import moment from 'moment'

import { Candle, Formatter } from '../../../types'
import { BitmexCandle } from '../types'

const formatter: Formatter<BitmexCandle> = {
  /**
   * Formats candles to TV candle.
   *
   * @param  {any} data
   * @return
   */
  tradingview: (data: BitmexCandle): Candle => {
    const { timestamp, open, close, high, low, volume } = data

    return {
      time: moment(timestamp).valueOf(),
      open: Number(open),
      close: Number(close),
      high: Number(high),
      low: Number(low),
      volume: Number(volume),
    }
  },
}

export default formatter
