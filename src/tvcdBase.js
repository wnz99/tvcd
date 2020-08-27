import { data$ } from './observables';

const tvcdBase = {
  fetchCandles: async (pair, interval, start, end, limit) => {
    console.log(
      `tvcd => fetchCandles(${pair}, ${interval}, ${start}, ${end}, ${limit})`
    );
  },
  data$,
};

export default tvcdBase;
