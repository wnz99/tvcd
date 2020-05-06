/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */

const makeSubs = (pairs) => {
  const subscriptions = [];

  for (const channel in pairs) {
    const { interval, symbols } = pairs[channel];

    subscriptions.push({
      op: 'subscribe',
      args: `tradeBin${interval}:${symbols[0]}${symbols[1]}`,
    });
  }

  return subscriptions;
};

export default makeSubs;
