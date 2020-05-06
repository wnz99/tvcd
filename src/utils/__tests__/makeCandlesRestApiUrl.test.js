import makeCandlesRestApiUrl, { makeQuery } from '../makeCandlesRestApiUrl';
import { EXCHANGE_NAME } from '../../const';

const rootUrl = 'https://api.com';
const queryParams = { test1: 'test1', test2: 'test2', test3: 'test3' };
const stringQuery = 'test1=test1&test2=test2&test3=test3';

describe('makeQuery function', () => {
  it('returns empty string success', () => {
    const query = makeQuery();
    expect(query).toEqual('');
  });
  it('returns correct query string success', () => {
    const query = makeQuery(queryParams);
    expect(query).toEqual(stringQuery);
  });
});

describe('makeCandlesRestApiUrl function', () => {
  it(`returns ${EXCHANGE_NAME.BITFINEX} query success`, () => {
    const params = { symbol: 'BTCUSD', interval: '1m', ...queryParams };
    const query = makeCandlesRestApiUrl(
      EXCHANGE_NAME.BITFINEX,
      'https://api.com',
      {
        // symbol: 'BTCUSD',
        // interval: '1m',
        ...params,
      }
    );
    expect(query).toEqual(
      `${rootUrl}/candles/trade:${params.interval}:t${params.symbol}/hist?limit=5000&${stringQuery}`
    );
  });
  it(`returns ${EXCHANGE_NAME.BINANCE} query success`, () => {
    const params = queryParams;
    const query = makeCandlesRestApiUrl(
      EXCHANGE_NAME.BINANCE,
      'https://api.com',
      {
        ...params,
      }
    );
    expect(query).toEqual(`${rootUrl}/klines?limit=1000&${stringQuery}`);
  });
  it('throws error on unsupported exhange success', () => {
    const params = queryParams;
    expect(() =>
      makeCandlesRestApiUrl('test', 'https://api.com', {
        ...params,
      })
    ).toThrowErrorMatchingSnapshot();
  });
});
