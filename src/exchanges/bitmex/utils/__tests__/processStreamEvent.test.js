import processStreamEvent from '../processStreamEvent';

const mockEvent = {
  data: JSON.stringify({
    data: [
      {
        close: 131.15,
        foreignNotional: 88927.72651985116,
        high: 131.25,
        homeNotional: 678.9308885729284,
        lastSize: 500,
        low: 130.85,
        open: 130.85,
        symbol: 'ETHUSD',
        timestamp: '2020-03-14T11:50:00.000Z',
        volume: 122885,
      },
    ],
    table: 'tradeBin1m',
  }),
};

const expectedCandleData = [
  'ETHUSD',
  {
    timestamp: '2020-03-14T11:50:00.000Z',
    close: 131.15,
    high: 131.25,
    low: 130.85,
    open: 130.85,
    volume: 122885,
  },
  '1m',
];

describe('processStreamEvent bitmex function', () => {
  it('should process a new candle event correctly', () => {
    const data = processStreamEvent(mockEvent);
    expect(data).toEqual(expectedCandleData);
  });
});
