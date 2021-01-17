import { concat } from 'rxjs';
import { map, reduce, filter } from 'rxjs/operators';
import makeChunkCalls from './makeChunkCalls';
import processUdfData from './processUdfData';

const sortByTime = (candles) => {
  return candles.sort((a, b) => {
    if (a.time) {
      return new Date(a.time) - new Date(b.time);
    }

    if (a.date) {
      return new Date(a.date) - new Date(b.date);
    }

    return new Date(a.timestamp) - new Date(b.timestamp);
  });
};

const fetchCandles = async (pair, interval, start, end, limit, opts) => {
  const {
    status,
    options,
    debug,
    status: { isUdf },
  } = opts;

  if (debug) {
    console.warn(
      `tvcd => ${status.exchange.name} fetchCandles(${pair}, ${interval}, ${start}, ${end}, ${limit})`
    );
  }

  const fetchCallsArray = makeChunkCalls(pair, interval, start, end, opts);

  return concat(...fetchCallsArray)
    .pipe(
      map((data) => (isUdf ? processUdfData(data) : data)),
      filter((data) => data[0] && data[0].date !== 0),
      reduce((acc, val) => [...acc, ...val], []),
      map((data) => {
        const candles = data.map((candle) => options.format(candle));
        return sortByTime(candles);
      })
    )
    .toPromise();
};

export default fetchCandles;
