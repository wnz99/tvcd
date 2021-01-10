import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, repeat, map } from 'rxjs/operators';
import { connectWs } from '../../../utils/ws';
import { onSubscriptionMsg, onPongMsg } from '.';

let ws;

const reconnect$ = new Subject();

const makeDataStream = (wsUrl, options) => {
  const { wsInstance$, debug } = options;

  ws = connectWs(wsUrl, {
    initSubs: (options && options.initSubs) || {},
    keepAlive: { msg: 'ping' },
    onPongCb: onPongMsg,
    onSubscriptionCb: onSubscriptionMsg,
    onReconnectCb: (err, wsInstance) => {
      ws = wsInstance;
      reconnect$.next();
    },
    onOpenCb: () => {
      if (debug) {
        console.log('tvcd => Bitmex WS opened');
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
          console.log('tvcd => Bitmex WS closed');
        }
      }
      if (debug) {
        console.log('tvcd => Bitmex dataFeed$ closed');
      }
    };
  }).pipe(
    filter((event) => event && event.data !== 'pong'),
    filter((event) => {
      const data = JSON.parse(event.data);

      return data.table;
    }),
    takeUntil(reconnect$),
    repeat()
  );

  return dataFeed$;
};

export default makeDataStream;
