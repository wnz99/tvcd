import moment from 'moment';
import { debugError, makeTimeChunks } from '.';
import timePeriods from './timePeriods';
import { fetchCandles$ } from '../observables';

const makeChunkCalls = (pair, interval, start, end, opts) => {
  const { options, makeCandlesUrlFn, requestOptions } = opts;

  if (!options.makeChunkCalls) {
    return [
      fetchCandles$(
        makeCandlesUrlFn(pair, interval, start, end),
        requestOptions
      ),
    ];
  }

  const apiLimit = options.apiLimit || 1000;

  const timePeriod = timePeriods[interval.slice(-1)];

  const unixInterval = moment
    .duration(Number(interval.slice(0, interval.length - 1)), timePeriod)
    .asMilliseconds();

  const chunksSize = Math.ceil(apiLimit * unixInterval);

  const timeIntervalChunks = makeTimeChunks(start, end, chunksSize);

  return timeIntervalChunks
    .map((chunk) => {
      try {
        return makeCandlesUrlFn(pair, interval, chunk.fromTime, chunk.toTime);
      } catch (e) {
        return debugError(e.message, options.debug);
      }
    })
    .map((url) => fetchCandles$(url, requestOptions));
};

export default makeChunkCalls;
