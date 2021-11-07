import _omit from 'lodash/omit';
import { Subject, Observable, interval as rxInterval, of, defer } from 'rxjs';
import {
  map,
  multicast,
  takeUntil,
  filter,
  skipUntil,
  take,
  catchError,
  switchMap,
} from 'rxjs/operators';
import axios from 'axios';

import { KUCOIN } from '../../const';
import { Options } from '../../types/exchanges';
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
  addTradingPair,
  removeTradingPair,
  makePair,
} from './utils';
import { WsEvent } from '../../utils/ws/types';
import {
  IExchange,
  ClientError,
  CandlesData,
  ClientOptions,
  PairConf,
  Pair,
  TokensSymbols,
  Candle,
} from '../../types';

import {
  WS_ROOT_URL,
  REST_ROOT_URL,
  API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
} from './const';
import { UpdateData, KucoinCandle } from './types';
import BaseExchange from '../base/baseExchange';
import { filterNullish } from '../../observables';

class Kucoin extends BaseExchange implements IExchange<KucoinCandle> {
  constructor() {
    super({
      wsRootUrl: WS_ROOT_URL,
      restRootUrl: REST_ROOT_URL,
      exchangeName: KUCOIN,
      apiResolutionsMap: API_RESOLUTIONS_MAP,
      makeCustomApiUrl,
    });

    this._options = { format: formatter.tradingview };
  }

  _options!: ClientOptions<KucoinCandle>;

  _dataSource$: Observable<WsEvent> | undefined = undefined;

  start = (opts: Options = { format: 'tradingview' }): undefined | string => {
    if (this._status.isRunning) {
      return debugError(ClientError.SERVICE_IS_RUNNING, this._status.isDebug);
    }

    this._options = makeOptions<KucoinCandle>(opts, formatter);

    this._dataSource$ = defer(() =>
      axios.post(`${this._exchangeConf.restRootUrl}/bullet-public`)
    ).pipe(
      switchMap((result) => {
        const connectId = new Date().valueOf();

        const { endpoint } = result.data.data.instanceServers[0];

        const wsUrl = `${endpoint}?token=${result.data.data.token}&[connectId=${connectId}]`;

        return makeDataStream(wsUrl, {
          wsInstance$: this._wsInstance$,
          debug: this._status.isDebug,
          connectId,
        });
      })
    );

    this._wsInstance$.subscribe((instance) => {
      this._ws = instance;
    });

    this._dataSource$
      .pipe(
        map((streamEvent) => processStreamEvent(streamEvent)),
        filterNullish(),
        map((streamData) =>
          mapToStandardInterval<UpdateData['data']['candles']>(
            streamData,
            this.options.intervals
          )
        ),
        filterNullish(),
        map((streamData) => {
          this._candlesData = addChannelToCandlesData<
            UpdateData['data']['candles']
          >(this._candlesData, streamData);
          return streamData;
        }),
        map((streamData) => {
          this._candlesData = updateCandles<
            UpdateData['data']['candles'],
            KucoinCandle
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
        catchError((error) => {
          console.warn(error);

          return of(error);
        }),
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
          symbol: makePair(symbols),
          type: this.options.intervals[timeInterval] as string,
          startAt: Math.ceil(startTime / 1000),
          endAt: Math.ceil(endTime / 1000),
        }
      );

    return fetchCandles<KucoinCandle>(pair, interval, start, end, {
      formatFn: this._options.format,
      makeChunks: true,
      apiLimit: 1500,
      debug: {
        exchangeName: this._exchangeConf.exchangeName,
        isDebug: this._status.isDebug,
      },
      makeCandlesUrlFn,
    });
  };

  addTradingPair = (
    pair: TokensSymbols,
    pairConf: PairConf
  ): string | undefined => {
    let newPair: Pair | undefined = undefined;

    try {
      newPair = this._addTradingPair(pair, pairConf);
    } catch (err) {
      if (err instanceof Error) {
        return err.message;
      }
    }

    if (!newPair) {
      return;
    }

    if (this._ws && this._ws.readyState === 1) {
      addTradingPair(this._ws, newPair);

      return undefined;
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
          return;
        }

        addTradingPair(this._ws, newPair);
      });

    return undefined;
  };

  removeTradingPair = (
    pair: TokensSymbols,
    interval: string
  ): string | undefined => {
    let removedPair;

    try {
      removedPair = this._removeTradingPair(pair, interval);
    } catch (err) {
      if (err instanceof Error) {
        return err.message;
      }
    }

    if (!this._ws) {
      return undefined;
    }

    if (!this._ws.subs) {
      return undefined;
    }

    if (!removedPair) {
      return undefined;
    }

    removeTradingPair(this._ws, removedPair);

    return undefined;
  };
}

export default Kucoin;
