import makeSubs from '../utils/makeSubs';

describe('makeSubs bitfinex function', () => {
  it('returns subscribtion array succes', () => {
    const pairs = {
      ETHUSD: { interval: '1m', symbols: ['ETH', 'USD'] },
      ZRXUSD: { interval: '1d', symbols: ['ZRX', 'USD'] },
    };
    const subArray = makeSubs(pairs);
    const expectedSubArray = [
      {
        event: 'subscribe',
        channel: 'candles',
        key: 'trade:1m:tETHUSD',
      },
      {
        event: 'subscribe',
        channel: 'candles',
        key: 'trade:1d:tZRXUSD',
      },
    ];
    expect(subArray).toEqual(expectedSubArray);
  });
});
