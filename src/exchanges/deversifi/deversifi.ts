import { Observable, of, Subject } from 'rxjs'
import { catchError, map, multicast, takeUntil } from 'rxjs/operators'

import { filterNullish } from '../../observables'
import {
  Candle,
  CandlesData,
  ClientError,
  ClientOptions,
  IExchange,
  Options,
  PairConf,
  TokensSymbols,
} from '../../types'
import {
  addChannelToCandlesData,
  debugError,
  fetchRestCandles,
  makeCandlesRestApiUrl,
  makeOptions,
  mapToStandardInterval,
  updateCandles,
} from '../../utils'
import { WsEvent } from '../../utils/ws/types'
import BaseExchange from '../base/baseExchange'
import { DeversifiCandle, UpdateData } from './types'
import {
  formatter,
  getExchangeConf,
  makeDataStream,
  makePair,
  makeWsMsg,
  processStreamEvent,
  processSubMsg,
} from './utils'

class Deverifi extends BaseExchange implements IExchange<DeversifiCandle> {
  constructor() {
    super({ ...getExchangeConf(), wsConf: { makeWsMsg } })

    this._options = { format: formatter.tradingview }
  }

  _options!: ClientOptions<DeversifiCandle>

  _dataSource$: Observable<WsEvent> | undefined = undefined

  start = (opts: Options = { format: 'tradingview' }): undefined | string => {
    if (this._status.isRunning) {
      return debugError(ClientError.SERVICE_IS_RUNNING, this._status.isDebug)
    }

    this._options = makeOptions<DeversifiCandle>(opts, formatter)

    if (Object.keys(this._tradingPairs).length === 0) {
      return debugError(ClientError.NO_INIT_PAIRS_DEFINED, this._status.isDebug)
    }

    this._dataSource$ = makeDataStream(this._exchangeConf.wsRootUrl, {
      wsInstance$: this._wsInstance$,
      isDebug: this._status.isDebug,
    })

    this._wsInstance$.subscribe((instance) => {
      this._ws = instance
    })

    this._dataSource$
      .pipe(
        map((streamEvent) => {
          this._tradingPairs = processSubMsg(streamEvent, this._tradingPairs)

          return processStreamEvent(streamEvent, this._tradingPairs)
        }),
        filterNullish(),
        map((streamData) =>
          mapToStandardInterval<UpdateData[1]>(
            streamData,
            this.options.intervals
          )
        ),
        filterNullish(),
        map((streamData) => {
          this._candlesData = addChannelToCandlesData<UpdateData[1]>(
            this._candlesData,
            streamData
          )
          return streamData
        }),
        map((streamData) => {
          if (streamData[1].length) {
            this._candlesData = updateCandles<UpdateData[1], DeversifiCandle>(
              streamData,
              this._candlesData,
              this._options.format,
              this._status.isDebug
            )
          }

          this._dataStream$.next(this._candlesData)

          return this._candlesData
        }),
        takeUntil(this._closeStream$),
        catchError((error) => {
          if (this._status.isDebug) {
            debugError(error.message)
          }

          return of(error)
        }),
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
    this._isIntervalSupported(interval)

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
          symbol: makePair(symbols[0], symbols[1]),
          interval: this.options.intervals[timeInterval] as string,
          start: startTime,
          end: endTime,
        }
      )

    return fetchRestCandles<DeversifiCandle>(pair, interval, start, end, {
      formatFn: this._options.format,
      makeChunks: true,
      debug: {
        exchangeName: this._exchangeConf.exchangeName,
        isDebug: this._status.isDebug,
      },
      apiLimit: 10000,
      makeCandlesUrlFn,
    })
  }

  addTradingPair = (
    pair: TokensSymbols,
    pairConf: PairConf
  ): string | undefined => {
    try {
      this._addTradingPair(pair, pairConf)
    } catch (err) {
      if (err instanceof Error) {
        return err.message
      }
    }

    return undefined
  }

  removeTradingPair = (
    pair: TokensSymbols,
    interval: string
  ): string | undefined => {
    try {
      this._removeTradingPair(pair, interval)
    } catch (err) {
      if (err instanceof Error) {
        return err.message
      }
    }

    return undefined
  }
}

export default Deverifi
