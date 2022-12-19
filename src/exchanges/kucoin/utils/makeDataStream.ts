import { Observable, Subject } from 'rxjs'
import { filter, repeat, takeUntil } from 'rxjs/operators'

import { TradingPairs } from '../../../types'
import { connectWs } from '../../../utils/ws'
import { WsEvent, WSInstance } from '../../../utils/ws/types'
import { WsSubscriptions } from '../types'
import { onPongMsg } from '.'

let ws: WSInstance

const reconnect$ = new Subject()

type Options = {
  wsInstance$: Subject<WSInstance>
  debug: boolean
  initialPairs?: TradingPairs
  subscriptions?: WsSubscriptions
  connectId: number
}
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
  const { wsInstance$, debug } = options

  ws = connectWs(wsUrl, {
    keepAlive: true,
    keepAliveMsg: JSON.stringify({
      id: options.connectId,
      type: 'ping',
    }),
    onPongCb: onPongMsg,
    onReconnectCb: (wsInstance) => {
      ws = wsInstance

      reconnect$.next(true)
    },
    onOpenCb: () => {
      if (debug) {
        console.log('tvcd => Kucoin WS opened')
      }
      wsInstance$.next(ws)
    },
  })

  const dataFeed$ = new Observable<WsEvent>((observer) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ws.addEventListener('message', (event: WsEvent) => {
      observer.next(event)
    })

    wsInstance$.next(ws)

    return () => {
      if (ws.readyState === 1) {
        ws.closeConnection()

        if (debug) {
          console.log('tvcd => Kucoin WS closed')
        }
      }
      if (debug) {
        console.log('tvcd => Kucoin dataFeed$ closed')
      }
    }
  }).pipe(
    filter((msg) => !!msg),
    takeUntil(reconnect$),
    repeat()
  )

  return dataFeed$
}

export default makeDataStream
