import moment from 'moment'
import { Observable, of, Subject } from 'rxjs'
import { catchError, filter, map, multicast, takeUntil } from 'rxjs/operators'

import { filterNullish } from '../../observables'
import {
  Candle,
  CandlesData,
  ClientError,
  ClientOptions,
  IExchange,
  Options,
  PairConf,
  Status,
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
import { BitmexCandle, RestApiCandle, WsApiCandle } from './types'
import {
  formatter,
  getExchangeConf,
  makeDataStream,
  makePair,
  makeWsMsg,
  processStreamEvent,
  processUdfData,
} from './utils'

class Bitmex extends BaseExchange implements IExchange<BitmexCandle> {
  constructor() {
    super({ ...getExchangeConf(), wsConf: { makeWsMsg } })

    this._options = { format: formatter.tradingview }
  }

  _options!: ClientOptions<BitmexCandle>

  _dataSource$: Observable<WsEvent> | undefined = undefined

  start = (opts: Options = { format: 'tradingview' }): undefined | string => {
    if (this._status.isRunning) {
      return debugError(ClientError.SERVICE_IS_RUNNING, this._status.isDebug)
    }

    this._options = makeOptions<BitmexCandle>(opts, formatter)

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
        filter((streamEvent) => {
          const data = JSON.parse(streamEvent.data)

          return data.action === 'insert'
        }),
        map((streamEvent) =>
          processStreamEvent(streamEvent, this._tradingPairs)
        ),
        filterNullish(),
        map((streamData) =>
          mapToStandardInterval<WsApiCandle>(streamData, this.options.intervals)
        ),
        filterNullish(),
        map((streamData) => {
          this._candlesData = addChannelToCandlesData<WsApiCandle>(
            this._candlesData,
            streamData
          )
          return streamData
        }),
        map((streamData) => {
          this._candlesData = updateCandles<WsApiCandle, BitmexCandle>(
            streamData,
            this._candlesData,
            this._options.format,
            this._status.isDebug
          )

          this._dataStream$.next(this._candlesData)

          return this._candlesData
        }),
        takeUntil(this._closeStream$),
        catchError((error) => {
          console.warn(error)
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
    this._stop()

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

    const limitDateToApiMinimun = (date: number) => {
      if (moment(date).isBefore('2010-01-01')) {
        return moment('2010-01-01').valueOf()
      }

      return date
    }

    const makeCandlesUrlFn = (
      symbols: TokensSymbols,
      timeInterval: string,
      startTime: number,
      endTime: number
    ) => {
      const params = this._exchangeConf.isUdf
        ? {
            symbol: makePair(symbols[0], symbols[1]),
            resolution:
              // eslint-disable-next-line operator-linebreak
              this.options.intervalsUdf &&
              (this.options.intervalsUdf[timeInterval] as string),
            from: moment(startTime).unix(),
            to: moment(endTime).unix(),
          }
        : {
            symbol: `${symbols[0]}${symbols[1]}`,
            binSize: this.options.intervals[timeInterval] as string,
            columns: 'open,close,high,low,volume',
            startTime: moment(startTime).toISOString(),
            endTime: moment(endTime).toISOString(),
            count: this._exchangeConf.apiLimit,
          }
      const restRootUrl = this._exchangeConf.isUdf
        ? `${this._exchangeConf.restRootUrl}/history`
        : `${this._exchangeConf.restRootUrl}/trade/bucketed`

      return makeCandlesRestApiUrl(
        this._exchangeConf.exchangeName,
        restRootUrl,
        params
      )
    }

    return fetchRestCandles<RestApiCandle>(
      pair,
      interval,
      limitDateToApiMinimun(start),
      limitDateToApiMinimun(end),
      {
        formatFn: this._options.format,
        isUdf: this._exchangeConf.isUdf,
        makeChunks: true,
        debug: {
          exchangeName: this._exchangeConf.exchangeName,
          isDebug: this._status.isDebug,
        },
        apiLimit: this._exchangeConf.apiLimit,
        processUdfDataFn: processUdfData,
        makeCandlesUrlFn,
      }
    )
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

  setStatus = (update: Partial<Status>): void => {
    this._status = { ...this._status, ...update }
  }
}

export default Bitmex
