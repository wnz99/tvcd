import _pickBy from 'lodash/pickBy';

const processStreamEvent = (event, tradingPairs) => {
  try {
    const msg = JSON.parse(event.data);

    const { data, table } = msg;

    const interval = table.replace('tradeBin', '');

    const { timestamp, open, high, low, close, volume, symbol } = data[0];

    const pair = _pickBy(
      tradingPairs,
      (item) => item.ticker === symbol && item.intervalApi === interval
    );

    if (pair) {
      const candleData = { timestamp, open, close, high, low, volume };

      return [Object.values(pair)[0].symbols, candleData, interval];
    }

    return null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
  }
  return null;
};

export default processStreamEvent;
