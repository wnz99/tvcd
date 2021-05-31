import { Formatter, Candle } from '../../../types';
import { PoloniexCandle } from '../types';

const formatter: Formatter<PoloniexCandle> = {
  /**
   * Formats candles to TV candle.
   *
   * @param  {any} data
   * @return
   */
  tradingview: (data: PoloniexCandle): Candle => {
    const { date, open, close, high, low, volume, time } = data;

    if (time) {
      return data;
    }

    return {
      time: Number(date * 1000),
      open: Number(open),
      close: Number(close),
      high: Number(high),
      low: Number(low),
      volume: Number(volume),
    };
  },
};

export default formatter;
