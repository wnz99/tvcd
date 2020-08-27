/* eslint-disable no-console */
import { subPairs } from './wsUtils';

const addTradingPair = (ws, tradingPairs, channelName, channelArgs) => {
  if (ws && !tradingPairs[channelName]) {
    try {
      subPairs(ws.send.bind(ws), { [channelName]: channelArgs });
      return { ...tradingPairs, [channelName]: channelArgs };
    } catch (e) {
      console.warn(e);
    }
  }

  return { ...tradingPairs, [channelName]: channelArgs };
};

export default addTradingPair;
