const pingWs = (sendFn, cb, pingMsg, pingTime) =>
  setInterval(() => {
    const msg = JSON.stringify(pingMsg);
    sendFn(msg);
    cb(new Date().getTime());
  }, pingTime);

export default pingWs;
