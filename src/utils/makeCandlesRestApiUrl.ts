import { EXCHANGE_NAME, ERROR } from '../const';

export const makeQuery = (
  params: { [key: string]: string | number | undefined } = {}
): string => {
  const query = Object.keys(params).reduce(
    (acc, param) => `${acc}${param}=${params[param]}&`,
    ''
  );

  return `${query.slice(0, -1)}`;
};

const makeCandlesRestApiUrl = (
  exchangeName: string,
  REST_ROOT_URL: string,
  params: { [key: string]: string | number | undefined }
): string => {
  switch (exchangeName) {
    case EXCHANGE_NAME.BITFINEX: {
      const { symbol, interval, ...rest } = params;

      return `${REST_ROOT_URL}/candles/trade:${interval}:t${symbol}/hist?limit=5000&${makeQuery(
        rest as unknown as { [key: string]: string | number | undefined }
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

    case EXCHANGE_NAME.GATEIO: {
      return `${REST_ROOT_URL}/spot/candlesticks?${makeQuery(params)}`;
    }

    case EXCHANGE_NAME.KAIKO: {
      const { symbol, exchange, ...rest } = params;

      // https://<eu|us>.market-api.kaiko.io/v1/data/trades.v1/exchanges/cbse/spot/btc-usd/aggregations/ohlcv
      return `${REST_ROOT_URL}/cbse/spot/${symbol}/aggregations/ohlcv?${makeQuery(
        rest as unknown as { [key: string]: string | number | undefined }
      )}`;
    }

    // https://api.valr.com/BTCZAR/buckets?periodSeconds=900&startTime=1620891180&endTime=1621082040

    case EXCHANGE_NAME.VALR: {
      const { pair, ...rest } = params;

      return `${REST_ROOT_URL}/${pair}/buckets?${makeQuery(rest)}`;
    }

    // https://docs.kucoin.com/#get-klines

    case EXCHANGE_NAME.KUCOIN: {
      return `${REST_ROOT_URL}/market/candles?${makeQuery(params)}`;
    }

    default:
      throw Error(ERROR.EXCHANGE_NOT_SUPPORTED);
  }
};

export default makeCandlesRestApiUrl;
