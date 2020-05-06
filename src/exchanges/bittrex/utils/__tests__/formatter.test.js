import formatter from '../formatter';

const mockCandle = {
  T: 1499040000000,
  O: '0.01634790',
  C: '0.80000000',
  H: '0.01575800',
  L: '0.01577100',
  V: '148976.11427815',
};

const expected = {
  time: 1499040000000,
  open: 0.0163479,
  close: 0.8,
  high: 0.015758,
  low: 0.015771,
  volume: 148976.11427815,
};

describe('formatter bittrex function', () => {
  it('should format data correctly', () => {
    const candle = formatter.tradingview(mockCandle);
    expect(candle).toEqual(expected);
  });
});
