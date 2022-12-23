import nock from 'nock'

import Deverfifi from './deversifi'

// nock.recorder.rec()

nock('https://api.rhino.fi:443', { encodedQueryParams: true })
  .get('/market-data/candles/trade:1h:ETH:USDT/hist')
  .query({ limit: '5000', start: '1671577200000', end: '1671663600000' })
  .reply(200, [
    [1580515200000, 9367.5, 9440.35927772, 9476.4, 9357.6, 599.16209861],
    [1580500800000, 9312.8, 9367.4, 9440, 9312.8, 897.23204737],
    [1580486400000, 9330.4, 9312.8, 9361, 9265.26171474, 965.77114787],
  ])

describe('Bitfinex', () => {
  it('should instantiate', () => {
    const dataSource = new Deverfifi()

    expect(dataSource).toBeDefined()
  })

  it('should have the proper methods', () => {
    const dataSource = new Deverfifi()

    expect(dataSource.addTradingPair).toBeDefined()
    expect(dataSource.fetchCandles).toBeDefined()
    expect(dataSource.start).toBeDefined()
    expect(dataSource.stop).toBeDefined()
    expect(dataSource.data$).toBeDefined()
  })
})

it('should fetch 1h candles', async () => {
  const dataSource = new Deverfifi()

  const candles = await dataSource.fetchCandles(
    ['ETH', 'USDT'],
    '1h',
    1671577200000,
    1671663600000
  )

  expect(candles).toEqual([
    {
      time: 1580486400000,
      open: 9330.4,
      close: 9312.8,
      high: 9361,
      low: 9265.26171474,
      volume: 965.77114787,
    },
    {
      time: 1580500800000,
      open: 9312.8,
      close: 9367.4,
      high: 9440,
      low: 9312.8,
      volume: 897.23204737,
    },
    {
      time: 1580515200000,
      open: 9367.5,
      close: 9440.35927772,
      high: 9476.4,
      low: 9357.6,
      volume: 599.16209861,
    },
  ])
})

it('should throw an error if interval not supported', async () => {
  const dataSource = new Deverfifi()

  await expect(
    dataSource.fetchCandles(['ETH', 'USD'], '4h', 1577836800000, 1580515200000)
  ).rejects.toThrow('Interval is not supported')
})
