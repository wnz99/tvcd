import { Pair } from '../../../types';

const makeWsMsg = (
  messageType: string,
  pair: Pair
): { [key: string]: unknown } | string | undefined => {
  const { intervalApi, symbols } = pair;

  const channel = `${symbols.join('').toLowerCase()}@kline_${intervalApi}`;

  switch (messageType) {
    case 'subscribe': {
      return {
        method: 'SUBSCRIBE',
        params: [channel],
        id: new Date().valueOf(),
      };
    }

    case 'unsubscribe': {
      return {
        method: 'UNSUBSCRIBE',
        params: [channel],
        id: new Date().valueOf(),
      };
    }

    default:
      return undefined;
  }
};

export default makeWsMsg;
