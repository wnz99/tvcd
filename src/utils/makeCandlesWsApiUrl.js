import { EXCHANGE_NAME, ERROR } from '../const';

export const makeBinanceQuery = (pairs = {}) => {
  const query = Object.keys(pairs).reduce(
    (acc, pair) =>
      `${acc}${pairs[pair].ticker.toLowerCase()}@kline_${
        pairs[pair].interval
      }/`,
    ''
  );

  return `${query.slice(0, -1)}`;
};

const makeCandlesWsApiUrl = (exchangeName, WS_ROOT_URL, pairs) => {
  switch (exchangeName) {
    case EXCHANGE_NAME.BINANCE: {
      return `${WS_ROOT_URL}/stream?streams=${makeBinanceQuery(pairs)}`;
    }
    default:
      throw Error(ERROR.EXCHANGE_NOT_SUPPORTED);
  }
};

export default makeCandlesWsApiUrl;
