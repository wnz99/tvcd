import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { connectWs } from '../../../utils/ws';

let ws;

const makeDataStream = (wsUrlFn, options) => {
  const { wsInstance$ } = options;

  const dataFeed$ = Observable.create((observer) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Binance dataFeed$ opened');
    }

    const pushEvent = (event) => observer.next(event);

    ws = connectWs(wsUrlFn(), {
      initSubs: (options && options.initSubs) || {},
      onReconnectCb: (err, data) => {
        ws.removeEventListener('message', pushEvent);

        ws = data;

        ws.addEventListener('message', pushEvent);
      },
    });

    ws.addEventListener('message', pushEvent);

    wsInstance$.next(ws);

    return () => {
      if (ws) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Binance dataFeed$ closed');
        }

        ws.close(1000, 'Close handle was called', {
          keepClosed: true,
        });
      }
    };
  }).pipe(filter((msg) => msg));

  return dataFeed$;
};

export default makeDataStream;
