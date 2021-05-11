import { Formatter, Candle } from '../../../types';
import { ApiCandle } from '../types';

const formatter: Formatter<ApiCandle> = {
  /**
   * Formats API candle to TV candle
   *
   * @param  {any} data
   * @return
   */
  tradingview: (data: ApiCandle): Candle => {
    if (Array.isArray(data)) {
      const [time, volume, close, high, low, open] = data;

      return {
        time,
        open,
        close,
        high,
        low,
        volume,
      };
    }

    const { t, o, c, h, l, v } = data;

    return {
      time: Number(t),
      open: Number(o),
      close: Number(c),
      high: Number(h),
      low: Number(l),
      volume: Number(v),
    };
  },
};

export default formatter;
