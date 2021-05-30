import { Formatter, Candle } from '../../../types';
import { FtxCandle } from '../types';

const formatter: Formatter<FtxCandle> = {
  /**
   * Formats candles to TV candle.
   *
   * @param  {any} data
   * @return
   */
  tradingview: (data: FtxCandle): Candle => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore

    const { close, high, low, open, startTime, volume } = data;

    return {
      time: new Date(startTime).valueOf(),
      open: Number(open),
      close: Number(close),
      high: Number(high),
      low: Number(low),
      volume: Number(volume),
    };
  },
};

export default formatter;
