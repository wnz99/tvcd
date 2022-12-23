import { oneHourCandlesMap } from './_fixtures__/oneHourCandles'
import { aggregateCandlesForward, chunkRight } from './aggregateCandlesForward'

const expected4HourCandles = [
  {
    time: 1671732000000,
    open: 16588,
    close: 16616,
    high: 16618,
    low: 16571,
    volume: 4.94232089,
  },
  {
    time: 1671717600000,
    open: 16781,
    close: 16590,
    high: 16787,
    low: 16572,
    volume: 49.7879832,
  },
  {
    time: 1671703200000,
    open: 16843,
    close: 16782,
    high: 16856,
    low: 16769,
    volume: 47.33364223,
  },
]

describe('aggregateCandlesForward', () => {
  it('should build 4H candles from 1H candles', () => {
    const candles = aggregateCandlesForward(oneHourCandlesMap)

    expect(candles).toEqual(expected4HourCandles)
  })
})

describe('chunkRight', () => {
  it('should chunk in reverse order', () => {
    const chunks = chunkRight(oneHourCandlesMap, 4)

    const expectedChunks = [
      [
        {
          time: 1671735600000,
          open: 16616,
          close: 16616,
          high: 16616,
          low: 16616,
          volume: 0.0054611799999999995,
        },
        {
          time: 1671732000000,
          open: 16588,
          close: 16616,
          high: 16618,
          low: 16571,
          volume: 4.93685971,
        },
      ],
      [
        {
          time: 1671728400000,
          open: 16661,
          close: 16590,
          high: 16662,
          low: 16572,
          volume: 12.89393152,
        },
        {
          time: 1671724800000,
          open: 16634,
          close: 16660,
          high: 16664,
          low: 16627,
          volume: 6.54284658,
        },
        {
          time: 1671721200000,
          open: 16669,
          close: 16634,
          high: 16709,
          low: 16621,
          volume: 13.47486497,
        },
        {
          time: 1671717600000,
          open: 16781,
          close: 16672,
          high: 16787,
          low: 16650,
          volume: 16.87634013,
        },
      ],
      [
        {
          time: 1671714000000,
          open: 16816,
          close: 16782,
          high: 16822,
          low: 16769,
          volume: 21.80029232,
        },
        {
          time: 1671710400000,
          open: 16835,
          close: 16816,
          high: 16842,
          low: 16816,
          volume: 9.52698432,
        },
        {
          time: 1671706800000,
          open: 16823,
          close: 16834,
          high: 16840,
          low: 16819,
          volume: 13.34145868,
        },
        {
          time: 1671703200000,
          open: 16843,
          close: 16823,
          high: 16856,
          low: 16822,
          volume: 2.66490691,
        },
      ],
    ]

    expect(chunks).toEqual(expectedChunks)
  })
})
