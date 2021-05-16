import _omit from 'lodash/omit';
import { Subject, Observable, interval as rxInterval, of } from 'rxjs';
import {
  map,
  multicast,
  takeUntil,
  filter,
  skipUntil,
  take,
  catchError,
} from 'rxjs/operators';
import { Options } from '../../types/exchanges';

import {
  debugError,
  fetchCandles,
  mapToStandardInterval,
  updateCandles,
  makeOptions,
  makePairConfig,
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
import { WSInstance, WsEvent } from '../../utils/ws/types';
import {
  IExchange,
  ClientError,
  TradingPairs,
  CandlesData,
  ClientOptions,
  PairConf,
  Pair,
  TokensSymbols,
} from '../../types';
import { EXCHANGE_NAME } from '../../const';
import {
  WS_ROOT_URL,
  REST_ROOT_URL,
  API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
} from './const';
import {
  CandlesStreamData,
  UpdateData,
  GateIoCandle,
  WsSubscriptions,
} from './types';
import { data$ } from '../../observables';

class GateIo implements IExchange<GateIoCandle> {
  _dataStream$ = new Subject<CandlesData>();

  _closeStream$ = new Subject<boolean>();

  _tradingPairs: TradingPairs = {};

  _candlesData: CandlesData = {};

  _wsInstance$: Subject<WSInstance> = new Subject();

  _ws: WSInstance | undefined = undefined;

  _options!: ClientOptions<GateIoCandle>;

  _dataSource$: Observable<WsEvent> | undefined = undefined;

  _status = {
    isRunning: false,
    exchange: { name: EXCHANGE_NAME.GATEIO },
    debug: false,
    wsRootUrl: WS_ROOT_URL,
    restRootUrl: REST_ROOT_URL,
  };

  _subscriptions: WsSubscriptions = {};

  options = {
    debug: false,
    intervals: API_RESOLUTIONS_MAP,
  };

  _resetConf = () => {
    this._closeStream$ = new Subject();
    this._wsInstance$ = new Subject();
    this._tradingPairs = {};
    this._candlesData = {};
    this._dataSource$ = undefined;
    this._ws = undefined;
    this._subscriptions = {};
    this._status = {
      ...this._status,
      isRunning: false,
      wsRootUrl: WS_ROOT_URL,
      restRootUrl: REST_ROOT_URL,
    };
  };

  start = (opts: Options = { format: 'tradingview' }) => {
    if (this._status.isRunning) {
      return debugError(ClientError.SERVICE_IS_RUNNING, this._status.debug);
    }

    this._options = makeOptions<GateIoCandle>(opts, formatter);

    this._dataSource$ = makeDataStream(this._status.wsRootUrl, {
      wsInstance$: this._wsInstance$,
      debug: this._status.debug,
      subscriptions: this._subscriptions,
    });

    this._wsInstance$.subscribe((instance) => {
      this._ws = instance;
    });

    this._dataSource$
      .pipe(
        map(
          (streamEvent) => processStreamEvent(streamEvent) as CandlesStreamData
        ),
        filter((streamEvent) => !!streamEvent),
        map((streamData) =>
          mapToStandardInterval<UpdateData['result']>(
            streamData,
            API_RESOLUTIONS_MAP
          )
        ),
        map((streamData) => {
          this._candlesData = addChannelToCandlesData<UpdateData['result']>(
            this._candlesData,
            streamData
          );
          return streamData;
        }),
        map((streamData) => {
          this._candlesData = updateCandles<UpdateData['result'], GateIoCandle>(
            streamData,
            this._candlesData,
            this._options.format,
            this._status.debug
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

    return this._status;
  };

  stop = () => {
    if (this._ws) {
      this._closeStream$.next(true);
      this._closeStream$.complete();
    }

    this._resetConf();

    this._status.isRunning = false;
  };

  fetchCandles = async (
    pair: TokensSymbols,
    interval: string,
    start: number,
    end: number,
    limit: number
  ) => {
    const makeCandlesUrlFn = (
      symbols: TokensSymbols,
      timeInterval: string,
      startTime: number,
      endTime: number
    ) =>
      makeCandlesRestApiUrl(
        this._status.exchange.name,
        this._status.restRootUrl,
        {
          currency_pair: makePair(symbols[0], symbols[1]),
          interval: API_RESOLUTIONS_MAP[timeInterval] as string,
          from: Math.ceil(startTime / 1000),
          to: Math.ceil(endTime / 1000),
        }
      );

    return fetchCandles<GateIoCandle>(pair, interval, start, end, limit, {
      formatFn: this._options.format,
      makeChunks: true,
      apiLimit: 999,
      debug: {
        exchangeName: this._status.exchange.name,
        isDebug: this._status.debug,
      },
      makeCandlesUrlFn,
    });
  };

  getTradingPairs = () => this._tradingPairs;

  getStatus = () => this._status;

  setDebug = (isDebug = false) => {
    this._status.debug = isDebug;
  };

  setApiUrl = (apiUrl: string) => {
    this._status.restRootUrl = makeCustomApiUrl(apiUrl);
  };

  addTradingPair = (
    pair: TokensSymbols,
    pairConf: PairConf
  ): string | undefined => {
    if (!pairConf) {
      return debugError(
        ClientError.NO_CONFIGURATION_PROVIDED,
        this._status.debug
      );
    }

    if (pairConf && !pairConf.interval) {
      return debugError(ClientError.NO_TIME_FRAME_PROVIDED, this._status.debug);
    }

    if (!Array.isArray(pair)) {
      return debugError(ClientError.PAIR_IS_NOT_ARRAY, this._status.debug);
    }

    if (!Object.keys(API_RESOLUTIONS_MAP).includes(pairConf.interval)) {
      return debugError(ClientError.INTERVAL_NOT_SUPPORTED, this._status.debug);
    }

    const conf = makePairConfig(pairConf, API_RESOLUTIONS_MAP);

    const ticker = `${pair[0]}:${pair[1]}`;

    const pairKey = `${conf.interval}:${ticker}`;

    const newPair: { [key: string]: Pair } = {
      [pairKey]: { ...conf, symbols: [...pair], ticker },
    };

    if (this._tradingPairs[pairKey]) {
      return debugError(ClientError.PAIR_ALREADY_DEFINED, this._status.debug);
    }

    this._tradingPairs = {
      ...this._tradingPairs,
      ...newPair,
    };

    if (this._ws && this._ws.readyState === 1) {
      const subscription = addTradingPair(
        this._ws.send.bind(this._ws),
        newPair
      );

      if (subscription) {
        this._subscriptions = { ...this._subscriptions, ...subscription };
      }

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
        if (!this._ws) {
          return;
        }

        const subscription = addTradingPair(
          this._ws.send.bind(this._ws),
          newPair
        );

        if (subscription) {
          this._subscriptions = {
            ...this._subscriptions,
            ...subscription,
          };
        }
      });

    return undefined;
  };

  removeTradingPair = (
    pair: TokensSymbols,
    intervalApi: string
  ): string | undefined => {
    if (!Array.isArray(pair)) {
      return debugError(ClientError.PAIR_IS_NOT_ARRAY, this._status.debug);
    }

    if (!intervalApi) {
      return debugError(ClientError.NO_TIME_FRAME_PROVIDED, this._status.debug);
    }

    const channel = `${intervalApi}:${pair[0]}${pair[1]}`;

    if (!this._tradingPairs[channel]) {
      return debugError(ClientError.PAIR_NOT_DEFINED, this._status.debug);
    }

    if (!this._ws) {
      return undefined;
    }

    if (!this._ws.subs) {
      return undefined;
    }

    removeTradingPair(
      this._ws.send.bind(this._ws),
      this._tradingPairs[channel]
    );

    this._tradingPairs = _omit(this._tradingPairs, channel);

    return undefined;
  };

  data$ = (channels: string[]) => data$(channels, this._dataStream$);
}

export default new GateIo();
