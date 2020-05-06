// Example REST time point response
// [
//   1499040000000,      // Open time
//   "0.01634790",       // Open
//   "0.80000000",       // High
//   "0.01575800",       // Low
//   "0.01577100",       // Close
//   "148976.11427815",  // Volume
//   1499644799999,      // Close time
//   "2434.19055334",    // Quote asset volume
//   308,                // Number of trades
//   "1756.87402397",    // Taker buy base asset volume
//   "28.46694368",      // Taker buy quote asset volume
//   "17928899.62484339" // Ignore.
// ]

const formatter = {
  tradingview: (data) => {
    const [time, open, high, low, close, volume] = data;

    return {
      time: Number(time),
      open: Number(open),
      close: Number(close),
      high: Number(high),
      low: Number(low),
      volume: Number(volume),
    };
  },
  default: (data) => {
    const [time, open, high, low, close, volume] = data;
    return {
      time,
      open,
      close,
      high,
      low,
      volume,
    };
  },
};

export default formatter;
