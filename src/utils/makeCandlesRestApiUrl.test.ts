import { Exchanges } from '../types'
import makeCandlesRestApiUrl, { makeQuery } from './makeCandlesRestApiUrl'

const rootUrl = 'https://api.com'
const queryParams = { test1: 'test1', test2: 'test2', test3: 'test3' }
const stringQuery = 'test1=test1&test2=test2&test3=test3'

describe('makeQuery function', () => {
  it('returns empty string success', () => {
    const query = makeQuery()
    expect(query).toEqual('')
  })

  it('returns correct query string success', () => {
    const query = makeQuery(queryParams)
    expect(query).toEqual(stringQuery)
  })
})

describe('makeCandlesRestApiUrl function', () => {
  it(`returns ${Exchanges.bitfinex} query success`, () => {
    const params = { symbol: 'BTCUSD', interval: '1m', ...queryParams }
    const query = makeCandlesRestApiUrl(Exchanges.bitfinex, 'https://api.com', {
      ...params,
    })
    expect(query).toEqual(
      `${rootUrl}/candles/trade:${params.interval}:t${params.symbol}/hist?limit=5000&${stringQuery}`
    )
  })

  it(`returns ${Exchanges.binance} query success`, () => {
    const params = queryParams
    const query = makeCandlesRestApiUrl(Exchanges.binance, 'https://api.com', {
      ...params,
    })
    expect(query).toEqual(`${rootUrl}/klines?limit=1000&${stringQuery}`)
  })

  it('throws error on unsupported exhange success', () => {
    const params = queryParams
    expect(() =>
      makeCandlesRestApiUrl('test' as Exchanges, 'https://api.com', {
        ...params,
      })
    ).toThrowErrorMatchingSnapshot()
  })
})
