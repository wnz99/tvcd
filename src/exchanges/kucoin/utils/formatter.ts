import { Candle, Formatter } from '../../../types'
import { KucoinCandle } from '../types'

const formatter: Formatter<KucoinCandle> = {
  /**
   * Formats API candle to TV candle.
   * 
   * API candles format:
   *
   * ```
   *[
        "1545904980",             //Start time of the candle cycle
        "0.058",                  //opening price
        "0.049",                  //closing price
        "0.058",                  //highest price
        "0.049",                  //lowest price
        "0.018",                  //Transaction amount
        "0.000945"                //Transaction volume
    ],
   * ```
   * 
   * @param  {any} data
   * @return
   */
  tradingview: (data: KucoinCandle): Candle => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const [time, open, close, high, low, , volume] = data

    return {
      time: Number(time) * 1000,
      open: Number(open),
      close: Number(close),
      high: Number(high),
      low: Number(low),
      volume: Number(volume),
    }
  },
}

export default formatter
