import { ERROR, EXCHANGE_NAME } from '../const'

export const makeQuery = (
  params: { [key: string]: string | number | undefined | boolean } = {}
): string => {
  const query = Object.keys(params).reduce(
    (acc, param) => `${acc}${param}=${params[param]}&`,
    ''
  )

  return `${query.slice(0, -1)}`
}

const makeCandlesRestApiUrl = (
  exchangeName: string,
  REST_ROOT_URL: string,
  params: { [key: string]: string | number | undefined | boolean }
): string => {
  switch (exchangeName) {
    case EXCHANGE_NAME.BITFINEX: {
      const { symbol, interval, ...rest } = params

      return `${REST_ROOT_URL}/candles/trade:${interval}:t${symbol}/hist?limit=5000&${makeQuery(
        rest as unknown as { [key: string]: string | number | undefined }
      )}`
    }

    case EXCHANGE_NAME.DEVERSIFI: {
      const { symbol, interval, ...rest } = params

      return `${REST_ROOT_URL}/market-data/candles/trade:${interval}:${symbol}/hist?limit=5000&${makeQuery(
        rest as unknown as { [key: string]: string | number | undefined }
      )}`
    }

    case EXCHANGE_NAME.BINANCE: {
      return `${REST_ROOT_URL}/klines?limit=1000&${makeQuery(params)}`
    }

    case EXCHANGE_NAME.BINANCE_FUTURES_USD: {
      return `${REST_ROOT_URL}/klines?limit=1000&${makeQuery(params)}`
    }

    case EXCHANGE_NAME.BINANCE_FUTURES_COIN: {
      return `${REST_ROOT_URL}/klines?limit=1000&${makeQuery(params)}`
    }

    case EXCHANGE_NAME.BITMEX: {
      return `${REST_ROOT_URL}?${makeQuery(params)}`
    }

    case EXCHANGE_NAME.BITTREX: {
      const { isLatest, ...rest } = params

      const GET_TICK = isLatest ? 'GetLatestTick' : 'GetTicks'

      return `${REST_ROOT_URL}/market/${GET_TICK}?${makeQuery(rest)}`
    }

    case EXCHANGE_NAME.POLONIEX: {
      return `${REST_ROOT_URL}?command=returnChartData&${makeQuery(params)}`
    }

    case EXCHANGE_NAME.GATEIO: {
      return `${REST_ROOT_URL}/spot/candlesticks?${makeQuery(params)}`
    }

    // https://ftx.com/api/markets/1INCH/USD/candles?resolution=300&limit=1000&start_time=1559881511&end_time=1559881711

    case EXCHANGE_NAME.FTX: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { market_name, ...rest } = params

      return `${REST_ROOT_URL}/markets/${market_name}/candles?${makeQuery(
        rest
      )}`
    }

    case EXCHANGE_NAME.KAIKO: {
      const { symbol, ...rest } = params

      // https://<eu|us>.market-api.kaiko.io/v1/data/trades.v1/exchanges/cbse/spot/btc-usd/aggregations/ohlcv
      return `${REST_ROOT_URL}/cbse/spot/${symbol}/aggregations/ohlcv?${makeQuery(
        rest as unknown as { [key: string]: string | number | undefined }
      )}`
    }

    // https://api.valr.com/BTCZAR/buckets?periodSeconds=900&startTime=1620891180&endTime=1621082040

    case EXCHANGE_NAME.VALR: {
      const { pair, ...rest } = params

      return `${REST_ROOT_URL}/${pair}/buckets?${makeQuery(rest)}`
    }

    // https://docs.kucoin.com/#get-klines

    case EXCHANGE_NAME.KUCOIN: {
      return `${REST_ROOT_URL}/market/candles?${makeQuery(params)}`
    }

    default:
      throw Error(
        `${ERROR.EXCHANGE_NOT_SUPPORTED}. Did you add the exchange to makeCandlesRestApiUrl?`
      )
  }
}

export default makeCandlesRestApiUrl
