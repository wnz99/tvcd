/* eslint-disable no-console */
import { Pair } from '../../../types';
import { WsSubscriptions } from '../types';
import makeSubs from './makeSubs';
/**
 * Subscribe pair to API ws
 *
 * @param  {(msg: string) => void} sendFn
 * @param  {string} channelName
 * @param  {Pair} Pair
 * @return void
 */
const addTradingPair = (
  sendFn: (msg: string) => void,
  pair: { [key: string]: Pair }
): WsSubscriptions | undefined => {
  try {
    const msgs = makeSubs(pair);

    Object.values(msgs).forEach((msg) => {
      sendFn(JSON.stringify(msg));
    });

    return msgs;
  } catch (e) {
    console.warn(e);

    return undefined;
  }
};

export default addTradingPair;
