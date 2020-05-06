import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, repeat, map } from 'rxjs/operators';
import { connectWs } from '../../../utils/ws';
import { onSubscriptionMsg, onPongMsg } from '.';

let ws;

const wsInstance$ = new Subject();

const reconnect$ = new Subject();

const makeDataStream = (wsUrl, options) => {
  ws = connectWs(wsUrl, {
    initSubs: (options && options.initSubs) || {},
    keepAlive: { msg: 'ping' },
    onPongCb: onPongMsg,
    onSubscriptionCb: onSubscriptionMsg,
    onReconnectCb: (err, data) => {
      ws = data;
      reconnect$.next();
    },
    onOpenCb: () => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Bitmex WS opened');
      }
    },
  });

  const dataFeed$ = Observable.create((observer) => {
    ws.addEventListener('message', (event) => {
      observer.next(event);
    });

    wsInstance$.next(ws);

    return () => {
      if (ws.readyState === 1) {
        ws.close();
        if (process.env.NODE_ENV === 'development') {
          console.warn('Bitmex WS closed');
        }
      }
      if (process.env.NODE_ENV === 'development') {
        console.warn('Bitmex dataFeed$ closed');
      }
    };
  }).pipe(
    filter((event) => event.data !== 'pong'),
    map((event) => {
      const data = JSON.parse(event.data);
      if (data.table) {
        return event;
      }
      return null;
    }),

    filter((event) => event),
    takeUntil(reconnect$),
    repeat()
  );

  return [wsInstance$, dataFeed$];
};

export default makeDataStream;
