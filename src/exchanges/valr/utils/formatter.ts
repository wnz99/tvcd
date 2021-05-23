import moment from 'moment';

import { Formatter, Candle } from '../../../types';
import { ValrCandle } from '../types';

const formatter: Formatter<ValrCandle> = {
  /**
   * Formats API candle to TV candle.
   *
   * Api candle:
   *
   * ```
   * {
   *  bucketPeriodInSeconds: 86400
   *  close: "227284"
   *  currencyPairSymbol: "BTCZAR"
   *  high: "228501"
   *  low: "222700"
   *  open: "226224"
   *  quoteVolume: "101844765.67750965"
   *  startTime: "2020-10-30T00:00:00Z"
   *  volume: "451.58780518"
   * }
   * ```
   *
   * @param  {any} data
   * @return
   */
  tradingview: (data: ValrCandle): Candle => {
    const { startTime, open, close, high, low, volume } = data;

    return {
      time: moment(startTime).valueOf(),
      open: Number(open),
      close: Number(close),
      high: Number(high),
      low: Number(low),
      volume: Number(volume),
    };
  },
};

export default formatter;
