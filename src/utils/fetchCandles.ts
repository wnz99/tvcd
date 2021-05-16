import { concat } from 'rxjs';
import { map, reduce, filter } from 'rxjs/operators';

import makeChunkCalls, { FetchCandlesOptions } from './makeChunkCalls';
import processUdfData, { UdfData } from './processUdfData';
import { Candle, TokensSymbols } from '../types';

const sortByTime = <T>(candles: T[]) =>
  candles.sort(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (a, b) => new Date(a.time) - new Date(b.time)
  );

const fetchCandles = async <T>(
  pair: TokensSymbols,
  interval: string,
  start: number,
  end: number,
  limit: number,
  opts: FetchCandlesOptions<T>
): Promise<Candle[] | undefined> => {
  const { debug, isUdf, formatFn } = opts;

  if (debug?.isDebug) {
    console.log(
      `tvcd => ${debug.exchangeName} fetchCandles(${pair}, ${interval}, ${start}, ${end}, ${limit})`
    );
  }

  const fetchCallsArray = makeChunkCalls<T>(
    pair,
    interval,
    start,
    end,
    limit,
    opts
  );

  return concat(...fetchCallsArray)
    .pipe(
      map((data) =>
        isUdf ? processUdfData((data as unknown) as UdfData) : data
      ),
      filter((data: any) => data[0] && data[0].date !== 0),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reduce((acc, val) => [...acc, ...val], []),
      map((data) => {
        const candles = data.map((candle) => formatFn(candle));

        return sortByTime(candles);
      })
    )
    .toPromise();
};

export default fetchCandles;