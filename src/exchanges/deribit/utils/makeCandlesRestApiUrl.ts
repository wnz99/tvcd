// https://www.deribit.com/api/v2/public/get_tradingview_chart_data?end_timestamp=1671359782192&instrument_name=BTC-PERPETUAL&resolution=30&start_timestamp=1671235200000

type Params = {
  resolution: string
  end_timestamp: number
  start_timestamp: number
  instrument_name: string
}

export const makeCandlesRestApiUrl = (
  baseUrl: string,
  params: Params
): string => {
  const candleUrl = new URL(`${baseUrl}/public/get_tradingview_chart_data`)

  Object.entries(params).forEach(([key, value]) => {
    candleUrl.searchParams.append(key, value.toString())
  })

  return candleUrl.href
}
