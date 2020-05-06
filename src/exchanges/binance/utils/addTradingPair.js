const addTradingPair = (pairs, channel, config) => ({
  ...pairs,
  [channel]: config,
});

export default addTradingPair;
