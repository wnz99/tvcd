/* eslint-disable no-console */
import { ChannelArgs } from '../../../types';
import makeSubs from './makeSubs';
/**
 * Subscribe pair to API ws
 *
 * @param  {(msg: string) => void} sendFn
 * @param  {string} channelName
 * @param  {ChannelArgs} channelArgs
 * @return void
 */
const addTradingPair = (
  sendFn: (msg: string) => void,
  channelName: string,
  channelArgs: ChannelArgs
): void => {
  try {
    const msgs = makeSubs({ [channelName]: channelArgs });

    msgs.forEach((msg) => {
      sendFn(JSON.stringify(msg));
    });

    return undefined;
  } catch (e) {
    console.warn(e);

    return undefined;
  }
};

export default addTradingPair;
