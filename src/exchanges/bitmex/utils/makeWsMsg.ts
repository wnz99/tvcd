import { Pair } from '../../../types';
import makePair from './makePair';

const makeWsMsg = (
  messageType: string,
  pair: Pair
): { [key: string]: unknown } | string | undefined => {
  const { intervalApi, symbols } = pair;

  switch (messageType) {
    case 'subscribe': {
      return {
        op: 'subscribe',
        args: `tradeBin${intervalApi}:${makePair(symbols[0], symbols[1])}`,
      };
    }

    case 'unsubscribe': {
      return {
        op: 'subscribe',
        args: `tradeBin${intervalApi}:${makePair(symbols[0], symbols[1])}`,
      };
    }

    default:
      return undefined;
  }
};

export default makeWsMsg;
