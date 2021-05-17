import _omitBy from 'lodash/omitBy';

import { WsEvent } from '../../../utils/ws/types';
import { WsSubscriptions } from '../types';

/**
 * Returns the subscription messages to be replayed on ws re-connection
 *
 * Example message received on successful subscription:
 *
 * {
 *  "id": 1234,
 *  "time":1620484100,
 *  "channel":"spot.candlesticks",
 *  "event":"subscribe",
 *  "result":{"status":"success"}
 * }
 *
 * @param  {WsEvent} event
 * @param  {WsSubscriptions} subs
 * @return WsSubscriptions
 */
const onSubscriptionMsg = (subs: WsSubscriptions) => (
  event: WsEvent,
  _subs: WsSubscriptions
): WsSubscriptions => {
  const msg = JSON.parse(event.data);

  switch (msg.event) {
    case 'subscribe': {
      return {
        ...subs,
      };
    }

    case 'unsubscribe': {
      return _omitBy(subs, (key) => key.id === msg.id);
    }
    default:
      return subs;
  }
};

export default onSubscriptionMsg;
