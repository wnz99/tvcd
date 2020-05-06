import moment from 'moment';

const formatter = {
  tradingview: (data) => {
    const { T, O, C, H, L, V } = data;

    return {
      time: moment(T).startOf('minute').valueOf(),
      open: Number(O),
      close: Number(C),
      high: Number(H),
      low: Number(L),
      volume: Number(V),
    };
  },
  default: (data) => {
    const { T, O, C, H, L, V } = data;

    return {
      time: moment(T).startOf('minute').valueOf(),
      open: O,
      close: C,
      high: H,
      low: L,
      volume: V,
    };
  },
};

export default formatter;
