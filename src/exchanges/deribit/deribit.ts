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
} from '../../types'
import {
  addChannelToCandlesData,
  debugError,
  fetchRestCandles,
  makeOptions,
  mapToStandardInterval,
  updateCandles,
} from '../../utils'
import { WsEvent } from '../../utils/ws/types'
import BaseExchange from '../base/baseExchange'
import { TokensSymbols } from './../../types/exchanges'
import { DeribitCandle, DeribitInstrument, UpdateData } from './types'
import {
  formatter,
  getExchangeConf,
  makeCandlesRestApiUrl,
  makeDataStream,
  makeInstrument,
  makeWsMsg,
  processStreamEvent,
  processSubMsg,
  processUdfData,
} from './utils'

class Deribit extends BaseExchange implements IExchange<DeribitCandle> {
  constructor() {
    const exchangeConf = getExchangeConf()

    super({ ...exchangeConf, wsConf: { makeWsMsg } })

    this._options = { format: formatter.tradingview }
  }

  _options!: ClientOptions<DeribitCandle>

  _dataSource$: Observable<WsEvent> | undefined = undefined

  start = (opts: Options = { format: 'tradingview' }): undefined | string => {
    if (this._status.isRunning) {
      return debugError(ClientError.SERVICE_IS_RUNNING, this._status.isDebug)
    }

    this._options = makeOptions<DeribitCandle>(opts, formatter)

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
            this._candlesData = updateCandles<UpdateData[1], DeribitCandle>(
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
    const makeCandlesUrlFn = (
      pair: TokensSymbols,
      timeInterval: string,
      startTime: number,
      endTime: number
    ) =>
      makeCandlesRestApiUrl(this._exchangeConf.restRootUrl, {
        instrument_name: makeInstrument(pair),
        resolution: this.options.intervals[timeInterval] as string,
        start_timestamp: startTime,
        end_timestamp: endTime,
      })

    return fetchRestCandles<DeribitCandle>(pair, interval, start, end, {
      formatFn: this._options.format,
      isUdf: this._exchangeConf.isUdf,
      makeChunks: true,
      debug: {
        exchangeName: this._exchangeConf.exchangeName,
        isDebug: this._status.isDebug,
      },
      apiLimit: 1000,
      processUdfDataFn: processUdfData,
      makeCandlesUrlFn,
    })
  }

  addTradingPair = (
    pair: DeribitInstrument,
    pairConf: PairConf
  ): string | undefined => {
    const tradingPair = (
      typeof pair === 'string' ? [pair, ''] : pair
    ) as TokensSymbols

    try {
      this._addTradingPair(tradingPair, pairConf)
    } catch (err) {
      if (err instanceof Error) {
        return err.message
      }
    }

    return undefined
  }

  removeTradingPair = (
    pair: DeribitInstrument,
    interval: string
  ): string | undefined => {
    const tradingPair = (
      typeof pair === 'string' ? [pair, ''] : pair
    ) as TokensSymbols

    try {
      this._removeTradingPair(tradingPair, interval)
    } catch (err) {
      if (err instanceof Error) {
        return err.message
      }
    }

    return undefined
  }
}

export default Deribit
