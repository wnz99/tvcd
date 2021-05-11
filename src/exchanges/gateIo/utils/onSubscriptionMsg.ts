import omit from 'lodash/omit';

import { WsEvent } from '../../../utils/ws/types';
import { WsSubscriptions } from '../types';

/**
 * Returns the subscription message to be replayed ws re-connection
 *
 * Example eessage receive on successful subscription:
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
const onSubscriptionMsg = (
  event: WsEvent,
  subs: WsSubscriptions
): WsSubscriptions => {
  const msg = JSON.parse(event.data);

  switch (msg.event) {
    case 'subscribe': {
      const { channel, id } = msg;

      if (subs[id]) {
        return subs;
      }

      return {
        ...subs,
        [msg.id]: {
          id,
          time: new Date().valueOf(),
          channel,
          event: 'subscribe',
        },
      };
    }

    case 'unsubscribe': {
      return omit(subs, [msg.id]);
    }
    default:
      return subs;
  }
};

export default onSubscriptionMsg;
