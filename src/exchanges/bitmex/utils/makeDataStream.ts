import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, repeat } from 'rxjs/operators';

import { WSInstance, WsEvent } from '../../../utils/ws/types';
import { connectWs } from '../../../utils/ws';
import { TradingPairs } from '../../../types';
import onPongMsg from './onPongMsg';

let ws: WSInstance;

const reconnect$ = new Subject();

type Options = {
  wsInstance$: Subject<WSInstance>;
  isDebug: boolean;
  initialPairs?: TradingPairs;
};
/**
 * Connects to ws and emits ws events. It also handles automatic re-connection.
 *
 * @param  {string} wsUrl
 * @param  {Options} options
 * @return Observable<WsEvent>
 */
const makeDataStream = (
  wsUrl: string,
  options: Options
): Observable<WsEvent> => {
  const { wsInstance$, isDebug } = options;

  ws = connectWs(wsUrl, {
    keepAlive: true,
    keepAliveMsg: 'ping',
    onPongCb: onPongMsg,
    onReconnectCb: (wsInstance) => {
      ws = wsInstance;

      reconnect$.next(true);
    },
    onOpenCb: () => {
      if (isDebug) {
        console.log('tvcd => Bitmex WS opened');
      }
      wsInstance$.next(ws);
    },
  });

  const dataFeed$ = new Observable<WsEvent>((observer) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ws.addEventListener('message', (event: WsEvent) => {
      observer.next(event);
    });

    wsInstance$.next(ws);

    return () => {
      if (ws.readyState === 1) {
        ws.closeConnection();

        if (isDebug) {
          console.log('tvcd => Bitmex WS closed');
        }
      }
      if (isDebug) {
        console.log('tvcd => Bitmex dataFeed$ closed');
      }
    };
  }).pipe(
    filter((event) => event && event.data !== 'pong'),
    filter((event) => {
      const data = JSON.parse(event.data);

      return !!data.table;
    }),
    takeUntil(reconnect$),
    repeat()
  );

  return dataFeed$;
};

export default makeDataStream;
