import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, repeat, map, retry } from 'rxjs/operators';
import { connectWs } from '../../../utils/ws';
import { onSubscriptionMsg, onPongMsg } from '.';

let ws;

const reconnect$ = new Subject();

const makeDataStream = (wsUrl, options = {}) => {
  const { initSubs, wsInstance$, debug } = options;

  ws = connectWs(wsUrl, {
    initMsg: initSubs || {},
    keepAlive: true,
    keepAliveMsg: JSON.stringify({ event: 'ping' }),
    onPongCb: onPongMsg,
    onSubscriptionCb: onSubscriptionMsg,
    onReconnectCb: (wsInstance) => {
      ws = wsInstance;

      reconnect$.next(true);
    },
    onOpenCb: () => {
      if (debug) {
        console.log('tvcd => Bitfinex WS opened');
      }

      wsInstance$.next(ws);
    },
  });

  const dataFeed$ = Observable.create((observer) => {
    ws.addEventListener('message', (event) => observer.next(event));

    wsInstance$.next(ws);

    return () => {
      if (ws.readyState === 1) {
        ws.close(1000, 'Close handle was called');

        if (debug) {
          console.log('tvcd => Bitfinex WS closed');
        }
      }
      if (debug) {
        console.log('tvcd => Bitfinex dataFeed$ closed');
      }
    };
  }).pipe(
    filter((msg) => msg),
    takeUntil(reconnect$),
    repeat()
  );

  return dataFeed$;
};

export default makeDataStream;
