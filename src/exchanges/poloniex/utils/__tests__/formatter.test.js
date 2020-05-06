import formatter from '../formatter';

describe('formatter poloniex function', () => {
  it('should format data with no time key correctly', () => {
    const mockCandle = {
      date: 1499040000,
      open: '0.01634790',
      close: '0.80000000',
      high: '0.01575800',
      low: '0.01577100',
      volume: '148976.11427815',
    };

    const expected = {
      time: 1499040000000,
      open: 0.0163479,
      close: 0.8,
      high: 0.015758,
      low: 0.015771,
      volume: 148976.11427815,
    };
    const candle = formatter.tradingview(mockCandle);
    expect(candle).toEqual(expected);
  });

  it('should format data with time key correctly', () => {
    const mockCandle = {
      time: 123,
    };

    const expected = {
      time: 123,
    };
    const candle = formatter.tradingview(mockCandle);
    expect(candle).toEqual(expected);
  });
});
