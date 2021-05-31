import { Formatter, Candle } from '../../../types';
import { DeversifiCandle } from '../types';

const formatter: Formatter<DeversifiCandle> = {
  /**
   * Formats candles to TV candle.
   *
   * @param  {any} data
   * @return
   */
  tradingview: (data: DeversifiCandle): Candle => {
    const [time, open, close, high, low, volume] = data;

    return {
      time: Number(time),
      open: Number(open),
      close: Number(close),
      high: Number(high),
      low: Number(low),
      volume: Number(volume),
    };
  },
};

export default formatter;
