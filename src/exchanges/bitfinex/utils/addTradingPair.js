/* eslint-disable no-console */
import { subPairs } from './wsUtils';

const addTradingPair = (ws, pairs, channel, config) => {
  if (ws && !pairs[channel]) {
    try {
      subPairs(ws.send.bind(ws), { [channel]: config });
      return { ...pairs, [channel]: config };
    } catch (e) {
      console.warn(e);
    }
  }

  return { ...pairs, [channel]: config };
};

export default addTradingPair;
