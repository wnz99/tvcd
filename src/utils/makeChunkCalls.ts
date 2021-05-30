import { Observable } from 'rxjs';
import moment from 'moment';

import { FormatFn } from '../types/exchanges';
import { debugError, makeTimeChunks } from '.';
import timePeriods from './timePeriods';
import { fetchCandles$ } from '../observables';
import { TokensSymbols } from '../types';

export type FetchCandlesOptions<T> = {
  makeCandlesUrlFn: (...args: any) => string;
  makeChunks?: boolean;
  apiLimit?: number;
  debug?: {
    exchangeName: string;
    isDebug: boolean;
  };
  isUdf?: boolean;
  formatFn: FormatFn<T>;
  requestOptions?: { [key: string]: string | number };
};

const makeChunkCalls = <T>(
  pair: TokensSymbols,
  interval: string,
  start: number,
  end: number,
  limit: number | undefined,
  opts: FetchCandlesOptions<T>
): Observable<T>[] => {
  const { makeCandlesUrlFn, requestOptions, makeChunks, apiLimit, debug } =
    opts;

  if (!makeChunks) {
    return [
      fetchCandles$<T>(
        makeCandlesUrlFn(pair, interval, start, end),
        requestOptions
      ),
    ];
  }

  let dataPointLimit = limit ?? 1000;

  if (apiLimit && limit) {
    dataPointLimit = Math.min(apiLimit, limit);
  }

  const timePeriod = timePeriods[interval.slice(-1)];

  const unixInterval = moment
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .duration(Number(interval.slice(0, interval.length - 1)), timePeriod)
    .asMilliseconds();

  const chunksSize = Math.ceil(dataPointLimit * unixInterval);

  const timeIntervalChunks = makeTimeChunks(start, end, chunksSize);

  return timeIntervalChunks
    .map((chunk) => {
      try {
        return makeCandlesUrlFn(pair, interval, chunk.fromTime, chunk.toTime);
      } catch (e) {
        return debugError(e.message, debug?.isDebug);
      }
    })
    .map((url) => fetchCandles$(url, requestOptions));
};

export default makeChunkCalls;
