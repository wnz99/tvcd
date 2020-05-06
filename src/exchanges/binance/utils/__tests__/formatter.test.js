import formatter from '../formatter';

const mockCandle = [
  1499040000000, // Open time
  '0.01634790', // Open
  '0.80000000', // High
  '0.01575800', // Low
  '0.01577100', // Close
  '148976.11427815', // Volume
  1499644799999, // Close time
  '2434.19055334', // Quote asset volume
  308, // Number of trades
  '1756.87402397', // Taker buy base asset volume
  '28.46694368', // Taker buy quote asset volume
  '17928899.62484339', // Ignore.
];

const expected = {
  time: 1499040000000,
  open: 0.0163479,
  close: 0.015771,
  high: 0.8,
  low: 0.015758,
  volume: 148976.11427815,
};

describe('formatter binance function', () => {
  it('should format data correctly', () => {
    const candle = formatter.tradingview(mockCandle);
    expect(candle).toEqual(expected);
  });
});
