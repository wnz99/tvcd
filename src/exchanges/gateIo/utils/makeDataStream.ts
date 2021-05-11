import { Observable, Subject } from 'rxjs';

import { filter, takeUntil, repeat } from 'rxjs/operators';
import { WSInstance, WsEvent } from '../../../utils/ws/types';
import { connectWs } from '../../../utils/ws';
import { onSubscriptionMsg, onPongMsg, makeSubs } from '.';
import { TradingPairs } from '../../../types';

let ws: WSInstance;

const reconnect$ = new Subject();

type Options = {
  wsInstance$: Subject<WSInstance>;
  debug: boolean;
  initialPairs: TradingPairs;
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
  const { initialPairs, wsInstance$, debug } = options;

  ws = connectWs(wsUrl, {
    initSubs: makeSubs(initialPairs),
    keepAlive: true,
    keepAliveMsg: JSON.stringify({
      time: new Date().valueOf(),
      channel: 'spot.ping',
    }),
    onPongCb: onPongMsg,
    onSubscriptionCb: onSubscriptionMsg,
    onReconnectCb: (wsInstance) => {
      ws = wsInstance;

      reconnect$.next(true);
    },
    onOpenCb: () => {
      if (debug) {
        console.log('tvcd => Gate.io WS opened');
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
        ws.close(1000, 'Close handle was called');

        if (debug) {
          console.log('tvcd => Gate.io WS closed');
        }
      }
      if (debug) {
        console.log('tvcd => Gate.io dataFeed$ closed');
      }
    };
  }).pipe(
    filter((msg) => !!msg),
    takeUntil(reconnect$),
    repeat()
  );

  return dataFeed$;
};

export default makeDataStream;
