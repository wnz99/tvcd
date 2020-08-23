import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, repeat } from 'rxjs/operators';
import { connectWs } from '../../../utils/ws';
import { onSubscriptionMsg, onPongMsg } from '.';

let ws;

const reconnect$ = new Subject();

const makeDataStream = (wsUrl, options = {}) => {
  const { initSubs, wsInstance$, debug } = options;

  ws = connectWs(wsUrl, {
    initSubs: initSubs || {},
    keepAlive: { msg: { event: 'ping' } },
    onPongCb: onPongMsg,
    onSubscriptionCb: onSubscriptionMsg,
    onReconnectCb: (_err, wsInstance) => {
      ws = wsInstance;
      reconnect$.next();
    },
    onOpenCb: () => {
      if (debug) {
        console.warn('Bitfinex WS opened');
      }
      wsInstance$.next(ws);
    },
  });

  const dataFeed$ = Observable.create((observer) => {
    ws.addEventListener('message', (event) => {
      observer.next(event);
    });

    wsInstance$.next(ws);

    return () => {
      if (ws.readyState === 1) {
        ws.close(1000, 'Close handle was called');

        if (debug) {
          console.warn('Bitfinex WS closed');
        }
      }
      if (debug) {
        console.warn('Bitfinex dataFeed$ closed');
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
