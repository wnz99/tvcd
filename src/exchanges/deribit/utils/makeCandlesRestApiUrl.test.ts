import { makeCandlesRestApiUrl } from './makeCandlesRestApiUrl'

// https://www.deribit.com/api/v2/public/get_tradingview_chart_data?resolution=30&end_timestamp=16713597821926&start_timestamp=1671235200000&instrument_name=BTC-PERPETUAL

describe('makeCandlesRestApiUrl', () => {
  it('should return correct url', () => {
    const url = makeCandlesRestApiUrl('https://www.deribit.com/api/v2', {
      resolution: '30',
      end_timestamp: 16713597821926,
      start_timestamp: 1671235200000,
      instrument_name: 'BTC-PERPETUAL',
    })

    expect(url).toBe(
      'https://www.deribit.com/api/v2/public/get_tradingview_chart_data?resolution=30&end_timestamp=16713597821926&start_timestamp=1671235200000&instrument_name=BTC-PERPETUAL'
    )
  })

  it('should return correct url 2', () => {
    const url = makeCandlesRestApiUrl('deribit', {
      resolution: '30',
      end_timestamp: 16713597821926,
      start_timestamp: 1671235200000,
      instrument_name: 'BTC-PERPETUAL',
    })

    expect(url).toBe(
      'https://www.deribit.com/api/v2/public/get_tradingview_chart_data?resolution=30&end_timestamp=16713597821926&start_timestamp=1671235200000&instrument_name=BTC-PERPETUAL'
    )
  })
})
