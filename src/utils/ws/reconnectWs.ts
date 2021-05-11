// eslint-disable-next-line import/no-cycle
import connectWs from './connectWs';
import { Options } from './types';

const reconnectWs = (url: string, connOpts: Options): NodeJS.Timeout =>
  setTimeout(() => {
    const ws = connectWs(url, { ...connOpts });

    if (connOpts.onReconnectCb) {
      connOpts.onReconnectCb(ws);
    }
  }, connOpts.retryDelay);

export default reconnectWs;
