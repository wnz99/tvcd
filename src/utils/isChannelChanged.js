const isChannelChanged = (prevChan, currChan) => {
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
