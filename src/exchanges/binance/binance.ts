import _omit from 'lodash/omit';
import { Subject, Observable, of } from 'rxjs';
import { map, multicast, takeUntil, catchError } from 'rxjs/operators';

import {
  debugError,
  fetchCandles,
  mapToStandardInterval,
  updateCandles,
  makeOptions,
  makeCandlesRestApiUrl,
  addChannelToCandlesData,
} from '../../utils';
import {
  formatter,
  makeDataStream,
  processStreamEvent,
  getExchangeConf,
  makeWsMsg,
} from './utils';
import { WsEvent } from '../../utils/ws/types';
import {
  IExchange,
  ClientError,
  ClientOptions,
  PairConf,
  TokensSymbols,
  Candle,
  Options,
  CandlesData,
} from '../../types';

import { UpdateData, BinanceCandle } from './types';
import BaseExchange from '../base/baseExchange';
import { filterNullish } from '../../observables';

class Binance extends BaseExchange implements IExchange<BinanceCandle> {
  constructor(conf: { dataSet: 'spot' | 'usdFutures' | 'coinFutures' }) {
    super({ ...getExchangeConf(conf.dataSet), wsConf: { makeWsMsg } });

    this._options = { format: formatter.tradingview };
  }

  _options!: ClientOptions<BinanceCandle>;

  _dataSource$: Observable<WsEvent> | undefined = undefined;

  start = (opts: Options = { format: 'tradingview' }): undefined | string => {
    if (this._status.isRunning) {
      return debugError(ClientError.SERVICE_IS_RUNNING, this._status.isDebug);
    }

    this._options = makeOptions<BinanceCandle>(opts, formatter);

    if (Object.keys(this._tradingPairs).length === 0) {
      return debugError(
        ClientError.NO_INIT_PAIRS_DEFINED,
        this._status.isDebug
      );
    }

    this._dataSource$ = makeDataStream(this._exchangeConf.wsRootUrl, {
      wsInstance$: this._wsInstance$,
      isDebug: this._status.isDebug,
    });

    this._wsInstance$.subscribe((instance) => {
      this._ws = instance;
    });

    this._dataSource$
      .pipe(
        map((streamEvent) =>
          processStreamEvent(streamEvent, this._tradingPairs)
        ),
        filterNullish(),
        map((streamData) =>
          mapToStandardInterval<UpdateData['data']['k']>(
            streamData,
            this.options.intervals
          )
        ),
        filterNullish(),
        map((streamData) => {
          this._candlesData = addChannelToCandlesData<UpdateData['data']['k']>(
            this._candlesData,
            streamData
          );
          return streamData;
        }),
        map((streamData) => {
          this._candlesData = updateCandles<
            UpdateData['data']['k'],
            BinanceCandle
          >(
            streamData,
            this._candlesData,
            this._options.format,
            this._status.isDebug
          );
          this._dataStream$.next(this._candlesData);

          return this._candlesData;
        }),
        takeUntil(this._closeStream$),
        catchError((error) => of(error)),
        multicast(() => new Subject<CandlesData>())
      )
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .connect();

    this._status.isRunning = true;

    return undefined;
  };

  stop = (): void => {
    if (this._ws) {
      this._closeStream$.next(true);
      this._closeStream$.complete();
    }

    this._dataSource$ = undefined;
    this._resetInstance();
    this._status.isRunning = false;
  };

  fetchCandles = async (
    pair: TokensSymbols,
    interval: string,
    start: number,
    end: number,
    limit: number
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
          symbol: `${symbols[0]}${symbols[1]}`,
          interval: this.options.intervals[timeInterval] as string,
          startTime,
          endTime,
        }
      );

    return fetchCandles<BinanceCandle>(pair, interval, start, end, limit, {
      formatFn: this._options.format,
      makeChunks: true,
      debug: {
        exchangeName: this._exchangeConf.exchangeName,
        isDebug: this._status.isDebug,
      },
      apiLimit: 1000,
      makeCandlesUrlFn,
    });
  };

  addTradingPair = (
    pair: TokensSymbols,
    pairConf: PairConf
  ): string | undefined => {
    try {
      this._addTradingPair(pair, pairConf);
    } catch (err) {
      return err.message;
    }

    return undefined;
  };

  removeTradingPair = (
    pair: TokensSymbols,
    interval: string
  ): string | undefined => {
    try {
      this._removeTradingPair(pair, interval);
    } catch (err) {
      return err.message;
    }

    return undefined;
  };
}

export default Binance;
