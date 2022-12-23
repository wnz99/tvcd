import _omit from 'lodash/omit'
import { interval as rxInterval, Subject } from 'rxjs'
import { filter, map, skipUntil, take } from 'rxjs/operators'

import { data$ } from '../../observables'
import {
  CandlesData,
  CandlesStream,
  ClientError,
  ExchangeConf,
  Pair,
  PairConf,
  PublicOptions,
  Status,
  TokensSymbols,
  TradingPairs,
  WsConf,
} from '../../types'
import { debugError, makePairConfig, makePairData } from '../../utils'
import { WSInstance } from '../../utils/ws/types'

class BaseExchange {
  constructor(conf: ExchangeConf) {
    this._status = {
      isRunning: false,
      isDebug: conf.isDebug ?? false,
    }

    this._wsConf = conf.wsConf

    this._exchangeConf = {
      ...conf,
      isUdf: conf.isUdf ?? false,
    }

    this.options = {
      intervals: conf.apiResolutionsMap,
      intervalsUdf: conf.apiResolutionsUdfMap,
    }
  }

  protected _dataStream$ = new Subject<CandlesData>()

  protected _closeStream$ = new Subject<boolean>()

  protected _wsInstance$: Subject<WSInstance> = new Subject()

  protected _ws: WSInstance | undefined = undefined

  protected _candlesData: CandlesData = {}

  protected _status: Status

  protected _exchangeConf: ExchangeConf

  protected _tradingPairs: TradingPairs = {}

  protected _wsConf?: WsConf = undefined

  options: PublicOptions

  protected _isWsActive = this._ws && this._wsConf

  protected _isIntervalSupported = (interval: string) => {
    if (!this.options.intervals[interval]) {
      throw Error(
        debugError(ClientError.INTERVAL_NOT_SUPPORTED, this._status.isDebug)
      )
    }
  }

  protected _stop = (): void => {
    if (this._ws) {
      this._closeStream$.next(true)
      this._closeStream$.complete()
    }
  }

  private _subscribePair(pair: { [key: string]: Pair }): Pair['ws'] {
    if (!this._wsConf) {
      return undefined
    }

    const [key, pairData] = Object.entries(pair)[0]

    const subscriptions = {
      subMsg: this._wsConf.makeWsMsg('subscribe', pairData),
    }

    if (this._ws?.readyState === 1 && subscriptions.subMsg) {
      this._ws.addSubscription({ [key]: subscriptions.subMsg })

      this._ws.send(JSON.stringify(subscriptions.subMsg))

      return subscriptions
    }

    rxInterval(200)
      .pipe(
        map((value, i) => {
          if (this._status.isDebug) {
            console.log(`tvcd => Waiting for ws connection: ${i}`)
          }

          return value
        }),
        skipUntil(
          this._wsInstance$.pipe(
            filter((instance) => instance.readyState === 1)
          )
        ),
        take(1)
      )
      .subscribe(() => {
        if (!this._ws || !subscriptions.subMsg) {
          return
        }

        this._ws.addSubscription({ [key]: subscriptions.subMsg })

        this._ws.send(JSON.stringify(subscriptions.subMsg))
      })

    return subscriptions
  }

  private _unsubscribePair(pair: { [key: string]: Pair }): void {
    if (!this._ws || !this._wsConf) {
      return undefined
    }

    const [key, pairData] = Object.entries(pair)[0]

    this._ws.deleteSubscription(key)

    const unsubMsg = this._wsConf.makeWsMsg('unsubscribe', pairData)

    this._ws.send(JSON.stringify(unsubMsg))

    return undefined
  }

  protected _resetInstance = (): void => {
    this._closeStream$ = new Subject()
    this._wsInstance$ = new Subject()
    this._tradingPairs = {}
    this._candlesData = {}
    this._ws = undefined
    this._status = {
      ...this._status,
      isRunning: false,
    }
  }

  protected _addTradingPair = (
    pair: TokensSymbols,
    pairConf: PairConf
  ): Pair => {
    if (!pairConf) {
      throw Error(
        debugError(ClientError.NO_CONFIGURATION_PROVIDED, this._status.isDebug)
      )
    }

    if (pairConf && !pairConf.interval) {
      throw Error(
        debugError(ClientError.NO_TIME_FRAME_PROVIDED, this._status.isDebug)
      )
    }

    if (!Array.isArray(pair)) {
      throw Error(
        debugError(ClientError.PAIR_IS_NOT_ARRAY, this._status.isDebug)
      )
    }

    if (
      !Object.keys(this._exchangeConf.apiResolutionsMap).includes(
        pairConf.interval
      )
    ) {
      throw Error(
        debugError(ClientError.INTERVAL_NOT_SUPPORTED, this._status.isDebug)
      )
    }

    const conf = makePairConfig(pairConf, this._exchangeConf.apiResolutionsMap)

    const { pairKey, pairData } = makePairData(pair, conf)

    if (this._tradingPairs[pairKey]) {
      throw Error(
        debugError(ClientError.PAIR_ALREADY_DEFINED, this._status.isDebug)
      )
    }

    const wsSubscriptions = this._subscribePair({ [pairKey]: pairData })

    const newPair = {
      [pairKey]: { ...pairData, ws: { ...pairData.ws, ...wsSubscriptions } },
    }

    this._tradingPairs = {
      ...this._tradingPairs,
      ...newPair,
    }

    return this._tradingPairs[pairKey]
  }

  protected _removeTradingPair = (
    pair: TokensSymbols,
    interval: string
  ): Pair => {
    if (!Array.isArray(pair)) {
      throw Error(
        debugError(ClientError.PAIR_IS_NOT_ARRAY, this._status.isDebug)
      )
    }

    if (!interval) {
      throw Error(
        debugError(ClientError.NO_TIME_FRAME_PROVIDED, this._status.isDebug)
      )
    }

    const channel = `${interval}:${pair[0]}${pair[1]}`

    if (!this._tradingPairs[channel]) {
      throw Error(
        debugError(ClientError.PAIR_NOT_DEFINED, this._status.isDebug)
      )
    }

    const removedPair = { ...this._tradingPairs[channel] }

    this._unsubscribePair({ [channel]: removedPair })

    this._tradingPairs = _omit(this._tradingPairs, channel)

    return removedPair
  }

  getTradingPairs = (): TradingPairs => this._tradingPairs

  getStatus = (): Status => this._status

  setDebug = (isDebug = false): void => {
    this._status.isDebug = isDebug
  }

  setApiUrl = (apiUrl: string, isUdf?: boolean): void => {
    this._exchangeConf.isUdf = isUdf

    this._exchangeConf.restRootUrl = this._exchangeConf.makeCustomApiUrl(
      apiUrl,
      isUdf
    )
  }

  data$ = (channels?: string[]): CandlesStream =>
    data$(channels, this._dataStream$)
}

export default BaseExchange
