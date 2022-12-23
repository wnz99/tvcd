/* eslint-disable @typescript-eslint/no-unused-vars */
import { BitfinexCandle } from '../types'
import { aggregateCandlesBackward } from './aggregateCandlesBackward'

const oneHourCandles: BitfinexCandle[] = [
  // #3
  [1671735600000, 16616, 16616, 16616, 16616, 0.0054611799999999995],
  [1671732000000, 16588, 16616, 16618, 16571, 4.93685971],
  [1671728400000, 16661, 16590, 16662, 16572, 12.89393152],
  [1671724800000, 16634, 16660, 16664, 16627, 6.54284658],
  // #2
  [1671721200000, 16669, 16634, 16709, 16621, 13.47486497],
  [1671717600000, 16781, 16672, 16787, 16650, 16.87634013],
  [1671714000000, 16816, 16782, 16822, 16769, 21.80029232],
  [1671710400000, 16835, 16816, 16842, 16816, 9.52698432],
  // #1
  [1671706800000, 16823, 16834, 16840, 16819, 13.34145868],
  [1671703200000, 16843, 16823, 16856, 16822, 2.66490691],
]

const expected4HourCandles: BitfinexCandle[] = [
  [1671724800000, 16634, 16616, 16664, 16571, 24.37909899],
  [1671710400000, 16835, 16634, 16842, 16621, 61.67848174],
  [1671703200000, 16843, 16834, 16856, 16819, 16.00636559],
]

describe('aggregateCandlesBackward', () => {
  it('should build 4H candles from 1H candles', () => {
    const candles = aggregateCandlesBackward(oneHourCandles)

    expect(candles).toEqual(expected4HourCandles)
  })
})
