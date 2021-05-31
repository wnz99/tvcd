/* eslint-disable no-console */
import { Pair } from '../../../types';
import { WsSubscriptions } from '../types';
import makeSubs from './makeSubs';
import { WSInstance } from '../../../utils/ws/types';

/**
 * Subscribe pair to API ws
 *
 * @param  {WSInstance} ws
 * @param  {Pair} pair
 * @return (WsSubscriptions | undefined)
 */
const addTradingPair = (
  ws: WSInstance,
  pair: Pair
): WsSubscriptions | undefined => {
  try {
    const msgs = makeSubs({ channel: pair });

    Object.values(msgs).forEach((msg) => {
      ws.send(JSON.stringify(msg));
    });

    ws.addSubscription(msgs);

    return msgs;
  } catch (e) {
    console.warn(e);

    return undefined;
  }
};

export default addTradingPair;
