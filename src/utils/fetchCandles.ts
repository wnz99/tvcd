import { concat } from 'rxjs'
import { filter, map, reduce } from 'rxjs/operators'

import { Candle, TokensSymbols } from '../types'
import { ProcessUdfDataFn } from '../types/exchanges'
import makeChunkCalls, { FetchCandlesOptions } from './makeChunkCalls'

const sortByTime = <T>(candles: T[]) =>
  candles.sort(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (a, b) => new Date(a.time) - new Date(b.time)
  )

type FetchCandleOptions<T> = FetchCandlesOptions<T> & {
  processUdfDataFn?: ProcessUdfDataFn<T>
}

const fetchCandles = async <T>(
  pair: TokensSymbols,
  interval: string,
  start: number,
  end: number,
  opts: FetchCandleOptions<T>
): Promise<Candle[]> => {
  const { debug, isUdf, formatFn, apiLimit, processUdfDataFn } = opts

  if (debug?.isDebug) {
    console.log(
      `tvcd => ${
        debug.exchangeName
      } fetchCandles(${pair}, ${interval}, ${start}, ${end}, ${
        apiLimit ?? 1000
      })`
    )
  }

  const limit = apiLimit ?? 1000

  const fetchCallsArray = makeChunkCalls<T>(
    pair,
    interval,
    start,
    end,
    limit,
    opts
  )

  return concat(...fetchCallsArray)
    .pipe(
      map((data) =>
        isUdf && processUdfDataFn ? processUdfDataFn(data) : data
      ),
      filter((data: any) => data[0] && data[0].date !== 0),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reduce<T[]>((acc, val) => [...acc, ...val], []),
      map((data) => {
        const candles = data.map((candle) => formatFn(candle))

        return sortByTime(candles)
      })
    )
    .toPromise()
}

export default fetchCandles
