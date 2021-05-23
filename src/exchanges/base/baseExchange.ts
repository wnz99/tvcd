import _omit from 'lodash/omit';
import { Subject, Observable } from 'rxjs';

import { debugError, makePairConfig } from '../../utils';
import {
  ClientError,
  TradingPairs,
  PairConf,
  Pair,
  TokensSymbols,
  ExchangeConf,
  Status,
  PublicOptions,
  CandlesData,
} from '../../types';
import { data$ } from '../../observables';
import { WSInstance } from '../../utils/ws/types';

class BaseExchange {
  constructor(conf: ExchangeConf) {
    this._status = {
      isRunning: false,
      exchange: { name: conf.exchangeName },
      debug: false,
      wsRootUrl: conf.wsRootUrl,
      restRootUrl: conf.restRootUrl,
    };

    this._exchangeConf = {
      ...conf,
    };

    this.options = {
      debug: false,
      intervals: conf.apiResolutionsMap,
    };
  }

  protected _dataStream$ = new Subject<CandlesData>();

  protected _closeStream$ = new Subject<boolean>();

  protected _wsInstance$: Subject<WSInstance> = new Subject();

  protected _ws: WSInstance | undefined = undefined;

  protected _candlesData: CandlesData = {};

  protected _status: Status;

  protected _exchangeConf: ExchangeConf;

  protected _tradingPairs: TradingPairs = {};

  options: PublicOptions;

  protected _resetInstance = (): void => {
    this._closeStream$ = new Subject();
    this._wsInstance$ = new Subject();
    this._tradingPairs = {};
    this._candlesData = {};
    this._ws = undefined;
    this._status = {
      ...this._status,
      isRunning: false,
    };
  };

  protected _addTradingPair = (
    pair: TokensSymbols,
    pairConf: PairConf
  ): Pair => {
    if (!pairConf) {
      throw Error(
        debugError(ClientError.NO_CONFIGURATION_PROVIDED, this._status.debug)
      );
    }

    if (pairConf && !pairConf.interval) {
      throw Error(
        debugError(ClientError.NO_TIME_FRAME_PROVIDED, this._status.debug)
      );
    }

    if (!Array.isArray(pair)) {
      throw Error(
        debugError(ClientError.PAIR_IS_NOT_ARRAY, this._status.debug)
      );
    }

    if (
      !Object.keys(this._exchangeConf.apiResolutionsMap).includes(
        pairConf.interval
      )
    ) {
      throw Error(
        debugError(ClientError.INTERVAL_NOT_SUPPORTED, this._status.debug)
      );
    }

    const conf = makePairConfig(pairConf, this._exchangeConf.apiResolutionsMap);

    const ticker = `${pair[0]}:${pair[1]}`;

    const pairKey = `${conf.interval}:${ticker}`;

    const newPair: { [key: string]: Pair } = {
      [pairKey]: { ...conf, symbols: [...pair], ticker },
    };

    if (this._tradingPairs[pairKey]) {
      throw Error(
        debugError(ClientError.PAIR_ALREADY_DEFINED, this._status.debug)
      );
    }

    this._tradingPairs = {
      ...this._tradingPairs,
      ...newPair,
    };

    return this._tradingPairs[pairKey];
  };

  protected _removeTradingPair = (
    pair: TokensSymbols,
    interval: string
  ): Pair => {
    if (!Array.isArray(pair)) {
      throw Error(
        debugError(ClientError.PAIR_IS_NOT_ARRAY, this._status.debug)
      );
    }

    if (!interval) {
      throw Error(
        debugError(ClientError.NO_TIME_FRAME_PROVIDED, this._status.debug)
      );
    }

    const channel = `${interval}:${pair[0]}${pair[1]}`;

    if (!this._tradingPairs[channel]) {
      throw Error(debugError(ClientError.PAIR_NOT_DEFINED, this._status.debug));
    }

    const removedPair = { ...this._tradingPairs[channel] };

    this._tradingPairs = _omit(this._tradingPairs, channel);

    return removedPair;
  };

  getTradingPairs = (): TradingPairs => this._tradingPairs;

  getStatus = (): Status => this._status;

  setDebug = (isDebug = false): void => {
    this._status.debug = isDebug;
  };

  setApiUrl = (apiUrl: string): void => {
    this._status.restRootUrl = this._exchangeConf.makeCustomApiUrl(apiUrl);
  };

  data$ = (channels: string[]): Observable<CandlesData> =>
    data$(channels, this._dataStream$);
}

export default BaseExchange;
