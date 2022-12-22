import { interval as rxInterval, Observable, of, Subject } from 'rxjs'
import {
  catchError,
  filter,
  map,
  multicast,
  skipUntil,
  take,
  takeUntil,
} from 'rxjs/operators'

import { filterNullish } from '../../observables'
import {
  Candle,
  CandlesData,
  ClientError,
  ClientOptions,
  Exchanges,
  IExchange,
  Options,
  Pair,
  PairConf,
  TokensSymbols,
} from '../../types'
import {
  addChannelToCandlesData,
  debugError,
  fetchCandles,
  makeCandlesRestApiUrl,
  makeOptions,
  mapToStandardInterval,
  updateCandles,
} from '../../utils'
import { WsEvent } from '../../utils/ws/types'
import BaseExchange from '../base/baseExchange'
import {
  API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
  REST_ROOT_URL,
  WS_ROOT_URL,
} from './const'
import { GateIoCandle, UpdateData } from './types'
import {
  addTradingPair,
  formatter,
  makeDataStream,
  makePair,
  processStreamEvent,
  removeTradingPair,
} from './utils'

class GateIo extends BaseExchange implements IExchange<GateIoCandle> {
  constructor() {
    super({
      wsRootUrl: WS_ROOT_URL,
      restRootUrl: REST_ROOT_URL,
      exchangeName: Exchanges.gateio,
      apiResolutionsMap: API_RESOLUTIONS_MAP,
      makeCustomApiUrl,
    })

    this._options = { format: formatter.tradingview }
  }

  _options!: ClientOptions<GateIoCandle>

  _dataSource$: Observable<WsEvent> | undefined = undefined

  start = (opts: Options = { format: 'tradingview' }): undefined | string => {
    if (this._status.isRunning) {
      return debugError(ClientError.SERVICE_IS_RUNNING, this._status.isDebug)
    }

    this._options = makeOptions<GateIoCandle>(opts, formatter)

    this._dataSource$ = makeDataStream(this._exchangeConf.wsRootUrl, {
      wsInstance$: this._wsInstance$,
      debug: this._status.isDebug,
    })

    this._wsInstance$.subscribe((instance) => {
      this._ws = instance
    })

    this._dataSource$
      .pipe(
        map((streamEvent) => processStreamEvent(streamEvent)),
        filterNullish(),
        map((streamData) =>
          mapToStandardInterval<UpdateData['result']>(
            streamData,
            this.options.intervals
          )
        ),
        filterNullish(),
        map((streamData) => {
          this._candlesData = addChannelToCandlesData<UpdateData['result']>(
            this._candlesData,
            streamData
          )
          return streamData
        }),
        map((streamData) => {
          this._candlesData = updateCandles<UpdateData['result'], GateIoCandle>(
            streamData,
            this._candlesData,
            this._options.format,
            this._status.isDebug
          )
          this._dataStream$.next(this._candlesData)

          return this._candlesData
        }),
        takeUntil(this._closeStream$),
        catchError((error) => of(error)),
        multicast(() => new Subject<CandlesData>())
      )
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .connect()

    this._status.isRunning = true

    return undefined
  }

  stop = (): void => {
    if (this._ws) {
      this._closeStream$.next(true)
      this._closeStream$.complete()
    }

    this._dataSource$ = undefined
    this._resetInstance()
    this._status.isRunning = false
  }

  fetchCandles = async (
    pair: TokensSymbols,
    interval: string,
    start: number,
    end: number
  ): Promise<Candle[]> => {
    const makeCandlesUrlFn = (
      symbols: TokensSymbols,
      timeInterval: string,
      startTime: number,
      endTime: number
    ) =>
      makeCandlesRestApiUrl(
        this._exchangeConf.exchangeName,
        this._exchangeConf.restRootUrl,
        {
          currency_pair: makePair(symbols[0], symbols[1]),
          interval: this.options.intervals[timeInterval] as string,
          from: Math.ceil(startTime / 1000),
          to: Math.ceil(endTime / 1000),
        }
      )

    return fetchCandles<GateIoCandle>(pair, interval, start, end, {
      formatFn: this._options.format,
      makeChunks: true,
      apiLimit: 999,
      debug: {
        exchangeName: this._exchangeConf.exchangeName,
        isDebug: this._status.isDebug,
      },
      makeCandlesUrlFn,
    })
  }

  addTradingPair = (
    pair: TokensSymbols,
    pairConf: PairConf
  ): string | undefined => {
    let newPair: Pair | undefined = undefined

    try {
      newPair = this._addTradingPair(pair, pairConf)
    } catch (err) {
      if (err instanceof Error) {
        return err.message
      }
    }

    if (!newPair) {
      return
    }

    if (this._ws && this._ws.readyState === 1) {
      addTradingPair(this._ws, newPair)

      return undefined
    }

    rxInterval(200)
      .pipe(
        skipUntil(
          this._wsInstance$.pipe(
            filter((instance) => instance.readyState === 1)
          )
        ),
        take(1)
      )
      .subscribe(() => {
        if (!this._ws || !newPair) {
          return
        }

        addTradingPair(this._ws, newPair)
      })

    return undefined
  }

  removeTradingPair = (
    pair: TokensSymbols,
    intervalApi: string
  ): string | undefined => {
    let removedPair: Pair | undefined = undefined

    try {
      removedPair = this._removeTradingPair(pair, intervalApi)
    } catch (err) {
      if (err instanceof Error) {
        return err.message
      }
    }

    if (!this._ws) {
      return undefined
    }

    if (!this._ws.subs) {
      return undefined
    }

    if (!removedPair) {
      return undefined
    }

    removeTradingPair(this._ws, removedPair)

    return undefined
  }
}

export default GateIo
