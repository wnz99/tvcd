import { Candle, Formatter } from '../../../types'
import { BinanceCandle } from '../types'

const formatter: Formatter<BinanceCandle> = {
  /**
   * Formats candles to TV candle.
   *
   * @param  {any} data
   * @return
   */
  tradingview: (data: BinanceCandle): Candle => {
    if (Array.isArray(data)) {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const [time, open, high, low, close, volume] = data

      return {
        time: Number(time),
        open: Number(open),
        close: Number(close),
        high: Number(high),
        low: Number(low),
        volume: Number(volume),
      }
    }

    const { t, o, c, h, l, v } = data

    return {
      time: Number(t),
      open: Number(o),
      close: Number(c),
      high: Number(h),
      low: Number(l),
      volume: Number(v),
    }
  },
}

export default formatter
