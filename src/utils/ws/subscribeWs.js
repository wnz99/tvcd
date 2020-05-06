/* eslint no-console: ["error", { allow: ["warn"] }] */

export const catchErr = (sendFn) => (msg) => {
  try {
    sendFn(msg);
  } catch (e) {
    console.warn(e);
  }
};

export const subPair = (sendFn) => (pair, channel) => {
  let msg;

  switch (channel) {
    case 'ticker': {
      msg = JSON.stringify({
        event: 'subscribe',
        channel,
        symbol: `t${pair}`,
      });
      break;
    }
    case 'book': {
      msg = JSON.stringify({
        event: 'subscribe',
        channel,
        symbol: `t${pair}`,
        freq: 'F1',
        prec: 'P0',
      });
      break;
    }
    default:
  }

  return catchErr(sendFn)(msg);
};

export const unsubPair = (sendFn) => (chanId) => {
  const msg = JSON.stringify({
    event: 'unsubscribe',
    chanId,
  });

  return catchErr(sendFn)(msg);
};
