/* eslint-disable @typescript-eslint/ban-ts-comment */
import omit from 'lodash/omit';
import WS from 'ws';
import conf from './env';
import pingWs from './pingWs';
// eslint-disable-next-line import/no-cycle
import reconnectWs from './reconnectWs';
import { WsEvent, Options, WSInstance } from './types';

function connectWs(url: string, opts: Partial<Options> = {}): WS | WebSocket {
  console.log(opts);
  const defOpts: Options = {
    initMsg: [],
    keepAlive: false,
    keepAliveMsg: 'ping',
    keepAliveTime: conf.wsPingTime,
    keepAliveTimeout: conf.wsTimeout,
    maxRetry: conf.wsMaxRetry,
    onCloseCb: undefined,
    onErrorCb: undefined,
    onMessageCb: undefined,
    onOpenCb: undefined,
    onPongCb: (event: WsEvent) =>
      event.data === 'pong' ? new Date().getTime() : null,
    onReconnectCb: undefined,
    onSubscriptionCb: undefined,
    retryDelay: conf.wsRetryDelay,
    subs: {},
  };

  const connOpts: Options = {
    ...defOpts,
    ...opts,
  };

  const {
    onOpenCb,
    onCloseCb,
    onMessageCb,
    onErrorCb,
    onSubscriptionCb,
    onPongCb,
    keepAlive,
    keepAliveMsg,
    keepAliveTime,
    keepAliveTimeout,
  } = connOpts;

  const ws: WSInstance =
    typeof window !== 'undefined' && window.WebSocket
      ? new WebSocket(url)
      : new WS(url);

  let pongTime = new Date().getTime();

  let td: NodeJS.Timeout;

  const isStaleFn = (pingTime: number) => {
    if (pingTime - pongTime > keepAliveTimeout) {
      if (ws.readyState === 1) {
        ws.close(3000, 'Connection timeout.');
      }

      if (td) {
        clearInterval(td);
      }
    }
  };

  ws.subs = connOpts.subs || {};

  // @ts-ignore
  ws.addEventListener('open', (event) => {
    if (keepAlive && ws.readyState === 1) {
      td = pingWs(ws.send.bind(ws), isStaleFn, keepAliveMsg, keepAliveTime);
    }

    const { initMsg: initSubs } = connOpts;

    // @ts-ignore
    const subs = Object.keys(ws.subs);

    if (initSubs.length && !subs.length) {
      initSubs.forEach((sub) => {
        ws.send(JSON.stringify(sub));
      });
    } else {
      subs.forEach((sub) => {
        // @ts-ignore
        ws.send(JSON.stringify(ws.subs[sub]));

        ws.subs = omit(ws.subs, sub);
      });
    }

    if (onOpenCb) {
      onOpenCb(event);
    }
  });

  // @ts-ignore
  ws.addEventListener(
    'close',
    (event: {
      wasClean: boolean;
      code: number;
      reason: string;
      target: WebSocket;
    }) => {
      if (td) {
        clearInterval(td);
      }

      if (event.code !== 1000) {
        reconnectWs(url, {
          ...connOpts,
          subs: {
            ...ws.subs,
          },
        });
      }

      if (onCloseCb) {
        onCloseCb(event);
      }
    }
  );

  // @ts-ignore
  ws.addEventListener('error', (err) => {
    if (onErrorCb) {
      onErrorCb(err);
    }
  });

  // @ts-ignore
  ws.addEventListener('message', (event: WsEvent) => {
    if (onSubscriptionCb) {
      ws.subs = onSubscriptionCb(event, {
        ...ws.subs,
      });
    }

    if (onPongCb) {
      const timeStamp = onPongCb(event);

      if (timeStamp) {
        pongTime = timeStamp;
      }
    }

    if (onMessageCb) {
      onMessageCb(event);
    }
  });

  return ws;
}

export default connectWs;
