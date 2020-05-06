import omit from 'lodash/omit';

const removeTradingPair = (pairs, channel, candlesData) => {
  if (pairs[channel]) {
    return [omit(pairs, channel), omit(candlesData, channel)];
  }
  return [omit(pairs, channel), candlesData];
};

export default removeTradingPair;
