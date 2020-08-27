import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { connectWs } from '../../../utils/ws';

// let ws;

const makeDataStream = (wsUrlFn, options = {}) => {
  const { wsInstance$, debug } = options;

  const dataFeed$ = Observable.create((observer) => {
    const wsUrl = wsUrlFn();

    if (process.env.NODE_ENV === 'development') {
      console.warn(`Binance dataFeed$ opened ${wsUrl}`);
    }

    const pushEvent = (event) => observer.next(event);

    let ws = connectWs(wsUrl, {
      initSubs: (options && options.initSubs) || {},
      onReconnectCb: (_err, wsInstance) => {
        console.warn('reconnect');
        ws.removeEventListener('message', pushEvent);

        ws = wsInstance;

        ws.addEventListener('message', pushEvent);
      },
    });

    ws.addEventListener('message', pushEvent);

    wsInstance$.next(ws);

    return () => {
      if (ws) {
        if (ws.readyState === 1) {
          if (debug) {
            console.warn(`Binance dataFeed$ closed ${wsUrl}`);
            console.warn(`ws status: ${ws.readyState}`);
          }
          ws.close(1000, 'Close handle was called');
        }
      }
    };
  }).pipe(filter((msg) => msg));

  return dataFeed$;
};

export default makeDataStream;
