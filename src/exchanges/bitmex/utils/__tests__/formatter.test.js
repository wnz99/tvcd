import formatter from '../formatter';

const mockCandle = {
  timestamp: 1499040000000, // Open time
  open: '0.01634790', // Open
  high: '0.80000000', // High
  low: '0.01575800', // Low
  close: '0.01577100', // Close
  volume: '148976.11427815', // Volume
};

const expected = {
  time: 1499040000000,
  open: 0.0163479,
  close: 0.015771,
  high: 0.8,
  low: 0.015758,
  volume: 148976.11427815,
};

describe('formatter bitmex function', () => {
  it('should format data correctly', () => {
    const candle = formatter.tradingview(mockCandle);
    expect(candle).toEqual(expected);
  });
});
