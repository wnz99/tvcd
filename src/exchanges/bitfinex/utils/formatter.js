const formatter = {
  tradingview: (data) => {
    const [time, open, close, high, low, volume] = data;
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
    const [time, open, close, high, low, volume] = data;
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
