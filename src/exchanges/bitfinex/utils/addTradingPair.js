/* eslint-disable no-console */
import { subPairs } from './wsUtils';

const addTradingPair = (ws, tradingPairs, channelName, Pair) => {
  if (ws && !tradingPairs[channelName]) {
    try {
      subPairs(ws.send.bind(ws), { [channelName]: Pair });
      return { ...tradingPairs, [channelName]: Pair };
    } catch (e) {
      console.warn(e);
    }
  }

  return { ...tradingPairs, [channelName]: Pair };
};

export default addTradingPair;
