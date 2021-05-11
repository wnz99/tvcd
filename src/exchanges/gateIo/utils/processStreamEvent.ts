import _omit from 'lodash/omit';

import { WsEvent } from '../../../utils/ws/types';
import { UpdateData, CandlesStreamData } from '../types';

type SubscribePairs = {
  [key: number]: {
    chanId: number;
    interval: string;
    ticker: string;
  };
};

let subscribedPairs: SubscribePairs = {};

/**
 * Formats event data and tracks subscribed pairs
 *
 * Example event data:
 *
 * ```json
 * {
 * "time": 1606292600,
 * "channel": "spot.candlesticks",
 * "event": "update",
 * "result": {
 *   "t": "1606292580",
 *   "v": "2362.32035",
 *   "c": "19128.1",
 *   "h": "19128.1",
 *   "l": "19128.1",
 *   "o": "19128.1",
 *   "n": "1m_BTC_USDT"
 *  }
 * }
 * ```
 *
 * @param  {WsEvent} event
 * @return (null | CandlesStreamData)
 */
const processStreamEvent = (event: WsEvent): undefined | CandlesStreamData => {
  const msg: UpdateData = JSON.parse(event.data);

  if (msg.event === 'update') {
    const { interval, ticker } = subscribedPairs[msg.id];

    return [ticker, msg.result, interval];
  }

  if (msg.event === 'subscribe') {
    const keys = msg.result.n.split('_');

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    subscribedPairs[msg.id] = `${keys[0]}:${keys[1]}${keys[2]}`;

    subscribedPairs[msg.id] = {
      chanId: msg.id,
      interval: keys[0],
      ticker: `${keys[1]}${keys[2]}`,
    };
  }

  if (msg.event === 'unsubscribed') {
    subscribedPairs = _omit(subscribedPairs, msg.id);
  }
};

export default processStreamEvent;
