import updateCandles, { isLastNthDataPoint } from '../updateCandles';

const formatFn = (data) => {
  const [time, open, high, low, close, volume] = data;
  return {
    time,
    open,
    close,
    high,
    low,
    volume,
  };
};
beforeEach(() => {
  // spyFn = jest
  //   .spyOn(global.console, 'warn')
  //   .mockImplementation(() => jest.fn());
});

afterEach(() => {
  // spyFn.mockRestore();
});

describe('updateCandles function', () => {
  it('should process initial snapshot', () => {
    const candlesData = {
      testChanl: {},
    };
    const data = [
      [1565969280000, 10279, 10267, 10279, 10250.71360198, 24.40366912],
      [1565969220000, 10295, 10283.99769106, 10299, 10270, 14.83202867],
    ];

    const expectedCandles = data.map((point) => formatFn(point));

    const expectedResult = {
      ...candlesData,
      '1m:ETHUSD': {
        pair: 'ETHUSD',
        interval: '1m',
        candles: expectedCandles,
        meta: {
          isSnapshot: true,
          isNewCandle: false,
          updateIndex: undefined,
        },
        seq: 0,
      },
    };

    const update = ['ETHUSD', data, '1m'];
    const result = updateCandles(update, candlesData, formatFn);

    expect(result).toEqual(expectedResult);
  });

  it('should process an update', () => {
    const candlesData = {
      '1m:ETHUSD': {
        pair: 'ETHUSD',
        interval: '1m',
        candles: [
          {
            time: 50,
            open: 1,
            close: 1,
            high: 1,
            low: 1,
            volume: 1,
          },
          {
            time: 40,
            open: 1,
            close: 1,
            high: 1,
            low: 1,
            volume: 1,
          },
        ],
        meta: {
          isSnapshot: true,
          isNewCandle: false,
          updateIndex: undefined,
        },
        seq: 0,
      },
    };
    const data = [50, 2, 2, 2, 2, 2];

    const expectedCandles = [
      {
        time: 50,
        open: 2,
        close: 2,
        high: 2,
        low: 2,
        volume: 2,
      },
      {
        time: 40,
        open: 1,
        close: 1,
        high: 1,
        low: 1,
        volume: 1,
      },
    ];

    const expectedResult = {
      '1m:ETHUSD': {
        pair: 'ETHUSD',
        interval: '1m',
        candles: expectedCandles,
        meta: {
          isSnapshot: false,
          isNewCandle: false,
          updateIndex: 0,
          isUpdateCandle: true,
        },
        seq: 1,
      },
    };

    const update = ['ETHUSD', data, '1m'];
    const result = updateCandles(update, candlesData, formatFn);

    expect(result).toEqual(expectedResult);
  });

  it('should process a new candle', () => {
    const candlesData = {
      '1m:ETHUSD': {
        pair: 'ETHUSD',
        interval: '1m',
        candles: [
          {
            time: 50,
            open: 1,
            close: 1,
            high: 1,
            low: 1,
            volume: 1,
          },
          {
            time: 40,
            open: 1,
            close: 1,
            high: 1,
            low: 1,
            volume: 1,
          },
        ],
        meta: {
          isSnapshot: true,
          isNewCandle: false,
          updateIndex: undefined,
        },
        seq: 0,
      },
    };
    const data = [60, 2, 2, 2, 2, 2];

    const expectedCandles = [
      {
        time: 60,
        open: 2,
        close: 2,
        high: 2,
        low: 2,
        volume: 2,
      },
      {
        time: 50,
        open: 1,
        close: 1,
        high: 1,
        low: 1,
        volume: 1,
      },
      {
        time: 40,
        open: 1,
        close: 1,
        high: 1,
        low: 1,
        volume: 1,
      },
    ];

    const expectedResult = {
      '1m:ETHUSD': {
        pair: 'ETHUSD',
        interval: '1m',
        candles: expectedCandles,
        meta: {
          isSnapshot: false,
          isNewCandle: true,
          updateIndex: 0,
          isUpdateCandle: false,
        },
        seq: 1,
      },
    };

    const update = ['ETHUSD', data, '1m'];
    const result = updateCandles(update, candlesData, formatFn);

    expect(result).toEqual(expectedResult);
  });
});

describe('isLastNthDataPoint function', () => {
  it('should detect new candle', () => {
    const candles = [{ time: 30 }, { time: 20 }, { time: 10 }, { time: 5 }];
    const entry = { time: 40 };
    const expectedResult = [0, true];

    const result = isLastNthDataPoint(2, candles, entry);

    expect(result).toEqual(expectedResult);
  });

  it('should detect update candle', () => {
    const candles = [{ time: 30 }, { time: 20 }, { time: 10 }, { time: 5 }];
    const entry = { time: 20 };
    const expectedResult = [1, false];

    const result = isLastNthDataPoint(2, candles, entry);

    expect(result).toEqual(expectedResult);
  });
});
