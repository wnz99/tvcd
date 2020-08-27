import omit from 'lodash/omit';
import { unsubPairs } from './wsUtils';

const removeTradingPair = (ws, pairs, channel, candlesData) => {
  if (ws && pairs[channel]) {
    const { intervalApi, symbols } = pairs[channel];
    const subscription = Object.values(ws.subs).filter(
      (sub) => sub.key === `trade:${intervalApi}:t${symbols[0]}${symbols[1]}`
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
