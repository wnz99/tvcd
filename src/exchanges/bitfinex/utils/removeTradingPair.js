import omit from 'lodash/omit';
import { unsubPairs } from './wsUtils';

const removeTradingPair = (ws, pairs, channel, candlesData) => {
  if (ws && pairs[channel]) {
    const { intervalApi, symbols } = pairs[channel];

    const ticker =
      symbols[0].length !== 3 || symbols[1].length !== 3
        ? `t${symbols[0]}:${symbols[1]}`
        : `t${symbols[0]}${symbols[1]}`;

    const subscription = Object.values(ws.subs).filter(
      (sub) => sub.key === `trade:${intervalApi}:${ticker}`
    );

    if (subscription.length) {
      try {
        unsubPairs(ws.send.bind(ws), [subscription[0].chanId]);
        return [omit(pairs, channel), omit(candlesData, channel)];
      } catch (e) {
        console.warn(e);
      }
    }
  }
  return [omit(pairs, channel), candlesData];
};

export default removeTradingPair;
