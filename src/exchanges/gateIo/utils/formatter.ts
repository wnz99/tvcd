import { Candle, Formatter } from '../../../types'
import { GateIoCandle } from '../types'

const formatter: Formatter<GateIoCandle> = {
  /**
   * Formats API candle to TV candle.
   *
   * @param  {any} data
   * @return
   */
  tradingview: (data: GateIoCandle): Candle => {
    if (Array.isArray(data)) {
      const [time, volume, close, high, low, open] = data

      return {
        time: Number(time) * 1000,
        open: Number(open),
        close: Number(close),
        high: Number(high),
        low: Number(low),
        volume: Number(volume),
      }
    }

    const { t, o, c, h, l, v } = data

    return {
      time: Number(t) * 1000,
      open: Number(o),
      close: Number(c),
      high: Number(h),
      low: Number(l),
      volume: Number(v),
    }
  },
}

export default formatter
