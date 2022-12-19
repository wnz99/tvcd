import moment from 'moment'

import { Candle, Formatter } from '../../../types'
import { BittrexCandle } from '../types'

const formatter: Formatter<BittrexCandle> = {
  /**
   * Formats candles to TV candle.
   *
   * @param  {any} data
   * @return
   */
  tradingview: (data: BittrexCandle): Candle => {
    if (data.time) {
      const { time, open, close, high, low, volume } = data

      return {
        time,
        open,
        close,
        high,
        low,
        volume,
      }
    }

    const { T, O, C, H, L, V } = data

    return {
      time: moment(T).startOf('minute').valueOf(),
      open: Number(O),
      close: Number(C),
      high: Number(H),
      low: Number(L),
      volume: Number(V),
    }
  },
}

export default formatter
