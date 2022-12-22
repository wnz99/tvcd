import { BigNumber } from 'bignumber.js'
import _chunk from 'lodash/chunk'

import { RestApiCandle } from './../types'

// A function to calculate the maximum value in an array
export const max = (arr: number[]) => Math.max(...arr)

// A function to calculate the minimum value in an array
export const min = (arr: number[]) => Math.min(...arr)

// A function to sum the values in an array
export const sum = (arr: number[]) =>
  arr.reduce((a, b) => new BigNumber(a).plus(b), new BigNumber(0)).toNumber()

// A function to return last value in an array
export const last = (arr: number[]) => arr[arr.length - 1]

// A function to return first value in an array
export const first = (arr: number[]) => arr[0]

export const aggregateCandles = (candles: RestApiCandle[], chunkSize = 4) => {
  const chunkedCandles = _chunk(candles, chunkSize)

  const aggregatedCandles = chunkedCandles.map((candles) => {
    const verticalChunkedCandles = candles.reduce(
      (curr, candle) => {
        const [t, o, c, h, l, v] = candle

        return {
          time: [...curr.time, t],
          open: [...curr.open, o],
          close: [...curr.close, c],
          high: [...curr.high, h],
          low: [...curr.low, l],
          volume: [...curr.volume, v],
        }
      },
      {
        time: [],
        open: [],
        close: [],
        high: [],
        low: [],
        volume: [],
      } as {
        time: number[]
        open: number[]
        close: number[]
        high: number[]
        low: number[]
        volume: number[]
      }
    )

    const time = last(verticalChunkedCandles.time)
    const open = last(verticalChunkedCandles.open)
    const close = first(verticalChunkedCandles.close)
    const high = max(verticalChunkedCandles.high)
    const low = min(verticalChunkedCandles.low)
    const volume = sum(verticalChunkedCandles.volume)

    return [time, open, close, high, low, volume]
  })

  return aggregatedCandles
}
