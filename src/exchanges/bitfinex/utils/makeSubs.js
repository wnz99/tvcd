/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import makePair from './makePair';

const makeSubs = (pairs) => {
  const subscriptions = [];

  for (const channel in pairs) {
    const { intervalApi, symbols } = pairs[channel];

    subscriptions.push({
      event: 'subscribe',
      channel: 'candles',
      key: `trade:${intervalApi}:t${makePair(symbols[0], symbols[1])}`,
    });
  }

  return subscriptions;
};

export default makeSubs;
