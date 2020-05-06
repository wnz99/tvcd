// eslint-disable-next-line import/no-cycle
import connectWs from './connectWs';

const reconnectWs = (url, connOpts) =>
  setTimeout(() => {
    const ws = connectWs(url, { ...connOpts });
    if (connOpts.onReconnectCb) {
      connOpts.onReconnectCb(null, ws);
    }

    return ws;
  }, connOpts.retryDelay);

export default reconnectWs;
