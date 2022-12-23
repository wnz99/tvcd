import { oneHourCandlesMap } from './_fixtures__/oneHourCandles'
import { aggregateCandlesBackward } from './aggregateCandlesBackward'

const expected4HourCandles = [
  {
    time: 1671724800000,
    open: 16634,
    close: 16616,
    high: 16664,
    low: 16571,
    volume: 24.37909899,
  },
  {
    time: 1671710400000,
    open: 16835,
    close: 16634,
    high: 16842,
    low: 16621,
    volume: 61.67848174,
  },
  {
    time: 1671703200000,
    open: 16843,
    close: 16834,
    high: 16856,
    low: 16819,
    volume: 16.00636559,
  },
]

describe('aggregateCandlesBackward', () => {
  it('should build 4H candles from 1H candles', () => {
    const candles = aggregateCandlesBackward(oneHourCandlesMap)

    expect(candles).toEqual(expected4HourCandles)
  })
})
