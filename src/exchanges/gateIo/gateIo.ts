import _omit from 'lodash/omit';
import { Subject, Observable, interval as rxInterval } from 'rxjs';
import {
  map,
  multicast,
  takeUntil,
  filter,
  skipUntil,
  take,
} from 'rxjs/operators';

import {
  debugError,
  fetchCandles,
  mapToStandardInterval,
  updateCandles,
  makeOptions,
  makePairConfig,
  makeCandlesRestApiUrl,
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
  Options,
  ClientError,
  TradingPairs,
  CandlesData,
  TradingPair,
  ClientOptions,
  PairConf,
  ChannelArgs,
} from '../../types';
import { EXCHANGE_NAME } from '../../const';
import {
  WS_ROOT_URL,
  REST_ROOT_URL,
  API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
} from './const';
import { CandlesStreamData, UpdateData, ApiCandle } from './types';

class GateIo implements IExchange<ApiCandle> {
  options!: { debug: boolean; intervals: { [key: string]: string | string[] } };

  _dataStream$!: Subject<CandlesData>;

  _closeStream$!: Subject<string>;

  _tradingPairs: TradingPairs = {};

  _candlesData: CandlesData = {};

  _wsInstance$: Subject<WSInstance> = new Subject();

  _ws: WSInstance | undefined = undefined;

  _options!: ClientOptions<ApiCandle>;

  _dataSource$: Observable<WsEvent> | undefined = undefined;

  _status = {
    isRunning: false,
    exchange: { name: EXCHANGE_NAME.BITFINEX },
    debug: false,
    wsRootUrl: WS_ROOT_URL,
    restRootUrl: REST_ROOT_URL,
  };

  _resetConf = () => {
    this._closeStream$ = new Subject();
    this._wsInstance$ = new Subject();
    this._tradingPairs = {};
    this._candlesData = {};
    this._dataSource$ = undefined;
    this._ws = undefined;
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

    this._options = makeOptions<ApiCandle>(opts, formatter);

    this._dataSource$ = makeDataStream(this._status.wsRootUrl, {
      initialPairs: this._tradingPairs,
      wsInstance$: this._wsInstance$,
      debug: this._status.debug,
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
          this._candlesData = updateCandles<UpdateData['result'], ApiCandle>(
            streamData,
            this._candlesData,
            this._options.format,
            this._status.debug
          );
          this._dataStream$.next(this._candlesData);

          return this._candlesData;
        }),
        takeUntil(this._closeStream$),
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
      this._closeStream$.next('close');
      this._closeStream$.complete();
    }

    this._resetConf();

    this._status.isRunning = false;
  };

  fetchCandles = async (
    pair: TradingPair,
    interval: string,
    start: number,
    end: number,
    limit: number
  ) => {
    const makeCandlesUrlFn = (
      symbols: TradingPair,
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
          from: startTime,
          to: endTime,
        }
      );

    return fetchCandles<ApiCandle>(pair, interval, start, end, limit, {
      formatFn: this._options.format,
      makeChunks: true,
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
    pair: TradingPair,
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

    const ticker = `${pair[0]}${pair[1]}`;

    const channelName = `${conf.interval}:${ticker}`;

    const channelArgs: ChannelArgs = { ...conf, symbols: [...pair], ticker };

    if (this._tradingPairs[channelName]) {
      return debugError(ClientError.PAIR_ALREADY_DEFINED, this._status.debug);
    }

    if (this._ws && this._ws.readyState === 1) {
      addTradingPair(this._ws.send.bind(this._ws), channelName, channelArgs);

      this._tradingPairs = {
        ...this._tradingPairs,
        [channelName]: channelArgs,
      };

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

        addTradingPair(this._ws.send.bind(this._ws), channelName, channelArgs);

        this._tradingPairs = {
          ...this._tradingPairs,
          [channelName]: channelArgs,
        };
      });

    return undefined;
  };

  removeTradingPair = (
    pair: TradingPair,
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
}

export default new GateIo();
