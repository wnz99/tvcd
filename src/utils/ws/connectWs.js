import omit from 'lodash/omit';
import WS from 'ws';
import conf from '../../env';
import pingWs from './pingWs';
// eslint-disable-next-line import/no-cycle
import reconnectWs from './reconnectWs';

function connectWs(url, opts = {}) {
  const defOpts = {
    initSubs: [],
    keepAlive: null,
    maxRetry: conf.wsMaxRetry,
    onErroCb: null,
    onMessageCb: null,
    onPongCb: null,
    onReconnectCb: null,
    onSubscriptionCb: null,
    retryDelay: conf.wsRetryDelay,
    timeout: conf.wsTimeout,
  };

  const connOpts = { ...defOpts, ...opts };

  const {
    onOpenCb,
    onCloseCb,
    onMessageCb,
    onErrorCb,
    onSubscriptionCb,
    onPongCb,
  } = connOpts;

  const ws =
    typeof window !== 'undefined' && window.WebSocket
      ? new WebSocket(url, connOpts.wsProtocols)
      : new WS(url);
  let pongTime = new Date().getTime();
  let td;

  const isStaleFn = (pingTime) => {
    if (pingTime - pongTime > connOpts.timeout) {
      if (ws.readyState === 1) {
        ws.close(3000, 'Connection timeout.');
      }
      if (td) {
        clearInterval(td);
      }
      if (onErrorCb) {
        onErrorCb(new Error('Stale connection detected.'), null);
      }
    }
  };

  ws.subs = connOpts.subs || {};

  ws.addEventListener('open', (event) => {
    if (connOpts.keepAlive && ws.readyState === 1) {
      td = pingWs(
        ws.send.bind(ws),
        isStaleFn,
        connOpts.keepAlive.msg,
        connOpts.keepAlive.time || conf.wsPingTime
      );
    }

    const { initSubs } = connOpts;
    const subs = Object.keys(ws.subs);

    if (initSubs.length && !subs.length) {
      initSubs.forEach((sub) => {
        ws.send(JSON.stringify(sub));
      });
    } else {
      subs.forEach((sub) => {
        ws.send(JSON.stringify(ws.subs[sub]));
        ws.subs = omit(ws.subs, sub);
      });
    }

    if (onOpenCb) {
      onOpenCb(null, event);
    }
  });

  ws.addEventListener('close', (event) => {
    if (td) {
      clearInterval(td);
    }

    if (event.code !== 1000) {
      reconnectWs(url, { ...connOpts, subs: { ...ws.subs } });
    }

    if (onCloseCb) {
      onCloseCb(null, event);
    }
  });

  ws.addEventListener('error', (err) => {
    if (onErrorCb) {
      onErrorCb(err, null);
    }
  });

  ws.addEventListener('message', (event) => {
    if (onSubscriptionCb) {
      ws.subs = onSubscriptionCb(null, event, { ...ws.subs });
    }

    if (onPongCb) {
      const timeStamp = onPongCb(null, event);
      if (timeStamp) {
        pongTime = timeStamp;
      }
    }

    if (onMessageCb) {
      onMessageCb(null, event);
    }
  });
  return ws;
}

export default connectWs;
