/* eslint-disable no-console */
import { subPairs } from './wsUtils';

const addTradingPair = (ws, pair) => {
  if (ws) {
    try {
      subPairs(ws.send.bind(ws), pair);
    } catch (e) {
      console.warn(e);
    }
  }
};

export default addTradingPair;
