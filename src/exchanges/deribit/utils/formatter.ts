import { Candle, Formatter } from '../../../types'
import { DeribitCandle } from '../types'

const formatter: Formatter<DeribitCandle> = {
  /**
   * Formats candles to TV candle.
   *
   * @param  {any} data
   * @return
   */
  tradingview: (data: DeribitCandle): Candle => {
    const { timestamp, open, close, high, low, volume } = data

    return {
      time: Number(timestamp),
      open: Number(open),
      close: Number(close),
      high: Number(high),
      low: Number(low),
      volume: Number(volume),
    }
  },
}

export default formatter
