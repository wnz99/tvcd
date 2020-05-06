import formatter from '../formatter';

const mockCandle = [
  1499040000000, // Open time
  '0.01634790', // Open
  '0.01577100', // Close
  '0.80000000', // High
  '0.01575800', // Low
  '148976.11427815', // Volume
];

const expected = {
  time: 1499040000000,
  open: 0.0163479,
  close: 0.015771,
  high: 0.8,
  low: 0.015758,
  volume: 148976.11427815,
};

describe('formatter bitfinex function', () => {
  it('should format data correctly', () => {
    const candle = formatter.tradingview(mockCandle);
    expect(candle).toEqual(expected);
  });
});
