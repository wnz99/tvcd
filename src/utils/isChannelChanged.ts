import { CandlesData } from '../types';

const isChannelChanged = (
  prevChan: CandlesData,
  currChan: CandlesData
): boolean => {
  const channels = Object.keys(currChan);

  const isDataEqual = channels.some((key) => {
    if (!prevChan[key]) {
      return true;
    }

    return currChan[key].seq !== prevChan[key].seq;
  });

  return isDataEqual;
};

export default isChannelChanged;
