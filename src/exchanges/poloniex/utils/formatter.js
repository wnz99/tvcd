const formatter = {
  tradingview: (data) => {
    const { date, open, close, high, low, volume, time } = data;

    if (time) {
      return data;
    }

    return {
      time: Number(date * 1000),
      open: Number(open),
      close: Number(close),
      high: Number(high),
      low: Number(low),
      volume: Number(volume),
    };
  },
  default: (data) => {
    const [date, open, close, high, low, volume] = data;
    return {
      time: date * 1000,
      open,
      close,
      high,
      low,
      volume,
    };
  },
};

export default formatter;
