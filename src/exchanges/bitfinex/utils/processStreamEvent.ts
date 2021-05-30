import _omit from 'lodash/omit';
import _findKey from 'lodash/findKey';

import { WsEvent } from '../../../utils/ws/types';
import { UpdateData, CandlesStreamData, SubscribeData } from '../types';
import { Pair, TradingPairs } from '../../../types/exchanges';

let subscribedPairs: Record<number, Pair> = {};

/**
 * Formats event data. 
 * 
 * Example event data:
 * 
 * ```
  [91014,"hb"]
  [91014,[1622073600000,39230,38507,40399,37162,1939.53510969]]
 * ```
 * @param  {WsEvent} event 
 * @param  {TradingPairs} tradingPairs 
 * @return (CandlesStreamData | undefined) 
 */

const processStreamEvent = (
  event: WsEvent,
  tradingPairs: TradingPairs
): CandlesStreamData | undefined => {
  const msg: UpdateData & SubscribeData = JSON.parse(event.data);

  if (msg.event === 'unsubscribed') {
    subscribedPairs = _omit(subscribedPairs, msg.chanId);

    return undefined;
  }

  if (Array.isArray(msg) && msg[1] !== 'hb') {
    const [chanId, data] = msg;

    if (data.length === 0) {
      return undefined;
    }

    if (!subscribedPairs[chanId]) {
      const key = _findKey(
        tradingPairs,
        (item) =>
          // eslint-disable-next-line operator-linebreak
          item.ws?.meta?.chanId === chanId
      );

      if (key) {
        subscribedPairs[chanId] = { ...tradingPairs[key] };
      }
    }

    const { intervalApi, symbols } = subscribedPairs[chanId];

    return [symbols, data, intervalApi];
  }

  return undefined;
};

export default processStreamEvent;
