import _chunk from 'lodash/chunk'

import { Candle } from '../../../types/exchanges'
import { first, last, max, min, sum } from './arrayUtils'

export const aggregateCandlesBackward = (
  candles: Candle[],
  chunkSize = 4
): Candle[] => {
  const chunkedCandles = _chunk(candles, chunkSize)

  const aggregatedCandles = chunkedCandles.map((candles) => {
    const verticalChunkedCandles = candles.reduce(
      (curr, candle) => {
        const { time, open, close, high, low, volume } = candle

        return {
          time: [...curr.time, time],
          open: [...curr.open, open],
          close: [...curr.close, close],
          high: [...curr.high, high],
          low: [...curr.low, low],
          volume: [...curr.volume, volume],
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

    return {
      time: last(verticalChunkedCandles.time),
      open: last(verticalChunkedCandles.open),
      close: first(verticalChunkedCandles.close),
      high: max(verticalChunkedCandles.high),
      low: min(verticalChunkedCandles.low),
      volume: sum(verticalChunkedCandles.volume),
    }
  })

  return aggregatedCandles
}
