import { AxiosRequestConfig } from 'axios'
import moment from 'moment'
import { Observable } from 'rxjs'

import { fetchCandles$ } from '../observables'
import { TokensSymbols } from '../types'
import { FormatFn } from '../types/exchanges'
import { debugError, makeTimeChunks } from '.'
import timePeriods from './timePeriods'

export type FetchCandlesOptions<T> = {
  makeCandlesUrlFn: (...args: any) => string
  makeChunks?: boolean
  apiLimit?: number
  debug?: {
    exchangeName: string
    isDebug: boolean
  }
  isUdf?: boolean
  formatFn: FormatFn<T>
  requestOptions?: AxiosRequestConfig
}

const makeChunkCalls = <T>(
  pair: TokensSymbols,
  interval: string,
  start: number,
  end: number,
  limit: number,
  opts: FetchCandlesOptions<T>
): Observable<T>[] => {
  const { makeCandlesUrlFn, requestOptions, makeChunks, debug } = opts

  if (!makeChunks) {
    const url = makeCandlesUrlFn(pair, interval, start, end)

    if (debug?.isDebug) {
      console.log(`tvcd => fetching ${url}`)
    }

    return [fetchCandles$<T>(url, requestOptions)]
  }

  const timePeriod = timePeriods[interval.slice(-1)]

  const unixInterval = moment
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .duration(Number(interval.slice(0, interval.length - 1)), timePeriod)
    .asMilliseconds()

  const chunksSize = Math.ceil(limit * unixInterval)

  const timeIntervalChunks = makeTimeChunks(start, end, chunksSize)

  return timeIntervalChunks
    .map((chunk) => {
      try {
        return makeCandlesUrlFn(pair, interval, chunk.fromTime, chunk.toTime)
      } catch (e) {
        if (e instanceof Error) {
          debugError(e.message, debug?.isDebug)
        }

        throw e
      }
    })
    .map((url) => {
      if (debug?.isDebug) {
        console.log(`tvcd => fetching ${url}`)
      }

      return url
    })
    .map((url) => {
      return fetchCandles$(url || '', requestOptions)
    })
}

export default makeChunkCalls
