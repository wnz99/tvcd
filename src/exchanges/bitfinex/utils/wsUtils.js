import makeSubs from './makeSubs';

export const subPairs = (sendFn, pairs) => {
  const msgs = makeSubs(pairs);
  msgs.forEach((msg) => {
    sendFn(JSON.stringify(msg));
  });
};

export const unsubPairs = (sendFn, chanIds) => {
  chanIds.forEach((chanId) => {
    const msg = JSON.stringify({
      event: 'unsubscribe',
      chanId,
    });
    sendFn(msg);
  });
};
