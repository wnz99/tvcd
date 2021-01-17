import { EXCHANGE_NAME, ERROR } from '../const';

export const makeQuery = (params = {}) => {
  const query = Object.keys(params).reduce(
    (acc, param) => `${acc}${param}=${params[param]}&`,
    ''
  );

  return `${query.slice(0, -1)}`;
};

const makeCandlesRestApiUrl = (exchangeName, REST_ROOT_URL, params) => {
  switch (exchangeName) {
    case EXCHANGE_NAME.BITFINEX: {
      const { symbol, interval, ...rest } = params;

      return `${REST_ROOT_URL}/candles/trade:${interval}:t${symbol}/hist?limit=5000&${makeQuery(
        rest
      )}`;
    }
    case EXCHANGE_NAME.BINANCE: {
      return `${REST_ROOT_URL}/klines?limit=1000&${makeQuery(params)}`;
    }
    case EXCHANGE_NAME.BITMEX: {
      return `${REST_ROOT_URL}?${makeQuery(params)}`;
    }
    case EXCHANGE_NAME.BITTREX: {
      return `${REST_ROOT_URL}/market/GetTicks?${makeQuery(params)}`;
    }
    case EXCHANGE_NAME.POLONIEX: {
      return `${REST_ROOT_URL}?command=returnChartData&${makeQuery(params)}`;
    }
    case EXCHANGE_NAME.KAIKO: {
      const { symbol, exchange, ...rest } = params;

      // https://<eu|us>.market-api.kaiko.io/v1/data/trades.v1/exchanges/cbse/spot/btc-usd/aggregations/ohlcv
      return `${REST_ROOT_URL}/cbse/spot/${symbol}/aggregations/ohlcv?${makeQuery(
        rest
      )}`;
    }
    default:
      throw Error(ERROR.EXCHANGE_NOT_SUPPORTED);
  }
};

export default makeCandlesRestApiUrl;

// https://poloniex.com/public?command=returnChartData&currencyPair=BTC_XMR&start=1546300800&end=1546646400&period=14400
