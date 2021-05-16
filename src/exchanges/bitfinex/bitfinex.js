import { Subject, interval as rxInterval } from 'rxjs';
import {
  map,
  multicast,
  takeUntil,
  filter,
  skipUntil,
  take,
  catchError,
} from 'rxjs/operators';

import {
  debugError,
  fetchCandles,
  makeCandlesRestApiUrl,
  makePairConfig,
  mapToStandardInterval,
  updateCandles,
} from '../../utils';
import {
  ERROR,
  WS_ROOT_URL,
  REST_ROOT_URL,
  API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
} from './const';
import {
  makeDataStream,
  addTradingPair,
  makeOptions,
  makeSubs,
  removeTradingPair,
  processStreamEvent,
  wsInst,
  makePair,
} from './utils';
import { EXCHANGE_NAME } from '../../const';
import { data$ } from '../../observables';

const bitfinex = (function bitfinex() {
  const dataStream$ = new Subject();
  let closeStream$ = new Subject();
  let wsInstance$ = wsInst();
  let candlesData = {};
  let tradingPairs = {};
  let dataSource$;
  let ws;
  let options;
  let status = {
    isRunning: false,
    exchange: { name: EXCHANGE_NAME.BITFINEX },
    debug: false,
    wsRootUrl: WS_ROOT_URL,
    restRootUrl: REST_ROOT_URL,
  };

  const resetConf = () => {
    closeStream$ = new Subject();
    wsInstance$ = wsInst();
    tradingPairs = {};
    candlesData = {};
    dataSource$ = undefined;
    ws = undefined;
    status = {
      ...status,
      isRunning: false,
      wsRootUrl: WS_ROOT_URL,
      restRootUrl: REST_ROOT_URL,
    };
  };

  const setStatus = (update) => {
    status = { ...status, ...update };
  };

  return {
    start: (opts = { format: 'tradingview' }) => {
      if (status.isRunning) {
        return debugError(ERROR.SERVICE_IS_RUNNING, status.debug);
      }

      options = makeOptions(opts);

      dataSource$ = makeDataStream(status.wsRootUrl, {
        initSubs: makeSubs(tradingPairs),
        wsInstance$,
        debug: status.debug,
      });

      wsInstance$.subscribe((instance) => {
        ws = instance;
      });

      dataSource$
        .pipe(
          map((streamEvent) => processStreamEvent(streamEvent)),
          filter((streamEvent) => streamEvent),
          map((streamData) =>
            mapToStandardInterval(streamData, API_RESOLUTIONS_MAP)
          ),
          map((streamData) => {
            candlesData = updateCandles(
              streamData,
              candlesData,
              options.format,
              status.debug
            );
            dataStream$.next(candlesData);
            return candlesData;
          }),
          catchError((error) => {
            if (status.debug) {
              console.warn(error);
            }
          }),
          takeUntil(closeStream$),
          multicast(() => new Subject())
        )
        .connect();

      setStatus({ isRunning: true });
      return status;
    },

    stop: () => {
      if (ws) {
        closeStream$.next();
        closeStream$.complete();
      }
      resetConf();
      setStatus({ isRunning: false });
    },

    fetchCandles: async (pair, interval, start, end, limit) => {
      const makeCandlesUrlFn = (symbols, timeInterval, startTime, endTime) =>
        makeCandlesRestApiUrl(status.exchange.name, status.restRootUrl, {
          symbol: makePair(symbols[0], symbols[1]),
          interval: API_RESOLUTIONS_MAP[timeInterval],
          start: startTime,
          end: endTime,
        });

      return fetchCandles(pair, interval, start, end, limit, {
        formatFn: options.format,
        makeChunks: true,
        debug: {
          exchangeName: status.exchange.name,
          isDebug: status.debug,
        },
        makeCandlesUrlFn,
      });
    },

    getTradingPairs: () => tradingPairs,

    getStatus: () => status,

    setDebug: (isDebug = false) => {
      status.debug = isDebug;
    },

    setApiUrl: (apiUrl) => {
      status.restRootUrl = makeCustomApiUrl(apiUrl);
    },

    addTradingPair: (pair, pairConf) => {
      if (!pairConf) {
        return debugError(ERROR.NO_CONFIGURATION_PROVIDED, status.debug);
      }
      if (pairConf && !pairConf.interval) {
        return debugError(ERROR.NO_TIME_FRAME_PROVIDED, status.debug);
      }
      if (!Array.isArray(pair)) {
        return debugError(ERROR.PAIR_IS_NOT_ARRAY, status.debug);
      }
      if (!Object.keys(API_RESOLUTIONS_MAP).includes(pairConf.interval)) {
        return debugError(ERROR.INTERVAL_NOT_SUPPORTED, status.debug);
      }

      const conf = makePairConfig(pairConf, API_RESOLUTIONS_MAP);

      const ticker = `${pair[0]}:${pair[1]}`;

      const channelName = `${conf.interval}:${ticker}`;

      const Pair = { ...conf, symbols: [...pair], ticker };

      if (tradingPairs[channelName]) {
        return debugError(ERROR.PAIR_ALREADY_DEFINED, status.debug);
      }

      if (ws && ws.readyState === 1) {
        tradingPairs = addTradingPair(ws, tradingPairs, channelName, Pair);

        return null;
      }

      rxInterval(200)
        .pipe(
          skipUntil(
            wsInstance$.pipe(filter((instance) => instance.readyState === 1))
          ),
          take(1)
        )
        .subscribe(() => {
          tradingPairs = addTradingPair(ws, tradingPairs, channelName, Pair);

          return tradingPairs;
        });

      return null;
    },

    removeTradingPair: (pair, interV) => {
      if (!Array.isArray(pair)) {
        return debugError(ERROR.PAIR_IS_NOT_ARRAY, status.debug);
      }

      if (!interV) {
        return debugError(ERROR.NO_TIME_FRAME_PROVIDED, status.debug);
      }

      const channel = `${interV}:${pair[0]}:${pair[1]}`;

      if (!tradingPairs[channel]) {
        return debugError(ERROR.PAIR_NOT_DEFINED, status.debug);
      }

      [tradingPairs, candlesData] = removeTradingPair(
        ws,
        tradingPairs,
        channel,
        candlesData
      );

      return null;
    },

    data$: (channels) => data$(channels, dataStream$),
  };
})();

bitfinex.options = {
  debug: false,
  intervals: API_RESOLUTIONS_MAP,
};

export default bitfinex;
