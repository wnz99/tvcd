const processStreamEvent = (event) => {
  try {
    const msg = JSON.parse(event.data);
    const { data, table } = msg;
    const interval = table.replace('tradeBin', '');
    const { timestamp, open, high, low, close, volume, symbol } = data[0];
    const ticker = `${symbol.slice(0, -3)}USD`;
    const candleData = { timestamp, open, close, high, low, volume };

    return [ticker, candleData, interval];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
  }
  return null;
};

export default processStreamEvent;
