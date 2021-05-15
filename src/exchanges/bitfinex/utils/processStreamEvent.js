import _omit from 'lodash/omit';

let subscribedPairs = {};

const processStreamEvent = (event) => {
  const msg = JSON.parse(event.data);

  if (Array.isArray(msg) && subscribedPairs[msg[0]] && msg[1] !== 'hb') {
    const { interval, ticker } = subscribedPairs[msg[0]];

    return [ticker, msg[1], interval];
  }

  if (msg.event === 'subscribed') {
    console.log('event: ', msg);
    const keys = msg.key.split(':');

    const ticker = Array.isArray(keys[2])
      ? [keys[2][0].substr(1), keys[2][1]]
      : [keys[2].substring(1, 4), keys[2].substring(keys[2].length - 3)];

    subscribedPairs[msg.chanId] = {
      chanId: msg.chanId,
      interval: keys[1],
      ticker,
    };
  }

  if (msg.event === 'unsubscribed') {
    subscribedPairs = _omit(subscribedPairs, msg.chanId);
  }

  return null;
};

export default processStreamEvent;
