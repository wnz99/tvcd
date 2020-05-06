import moment from 'moment';

const formatter = {
  tradingview: (data) => {
    const { timestamp, open, close, high, low, volume } = data;

    return {
      time: moment(timestamp).valueOf(),
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
