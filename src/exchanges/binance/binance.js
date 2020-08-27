import { Subject } from 'rxjs';
import { map, multicast, takeUntil, repeatWhen } from 'rxjs/operators';
import {
  debugError,
  makeCandlesRestApiUrl,
  fetchCandles,
  updateCandles,
  makePairConfig,
  mapToStandardInterval,
} from '../../utils';
import {
  ERROR,
  WS_ROOT_URL,
  REST_ROOT_URL,
  API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
} from './const';
import {
  makeCandlesWsApiUrl,
  addTradingPair,
  makeOptions,
  removeTradingPair,
  processStreamEvent,
  makeDataStream,
  addChannelToCandlesData,
} from './utils';
import { EXCHANGE_NAME } from '../../const';
import { data$ } from '../../observables';

const binance = (function binance() {
  const dataStream$ = new Subject();
  let closeStream$ = new Subject();
  let wsInstance$ = new Subject();
  let addTradingPairToStream$ = new Subject();
  let candlesData = {};
  let pairs = {};
  let dataSource$;
  let ws;
  let options;
  let status = {
    isRunning: false,
    exchange: { name: EXCHANGE_NAME.BINANCE },
    debug: false,
    wsRootUrl: WS_ROOT_URL,
    restRootUrl: REST_ROOT_URL,
  };

  const resetConf = () => {
    closeStream$ = new Subject();
    wsInstance$ = new Subject();
    addTradingPairToStream$ = new Subject();
    pairs = {};
    candlesData = {};
    dataSource$ = undefined;
    ws = undefined;
    status = {
      ...status,
      isRunning: false,
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

      if (Object.keys(pairs).length === 0) {
        return debugError(ERROR.NO_INIT_PAIRS_DEFINED, status.debug);
      }

      const wsUrl = () => makeCandlesWsApiUrl(status.wsRootUrl, pairs);

      dataSource$ = makeDataStream(wsUrl, { wsInstance$, debug: status.debug });

      wsInstance$.subscribe((instance) => {
        ws = instance;
      });

      dataSource$
        .pipe(
          map((streamEvent) => processStreamEvent(streamEvent)),
          map((streamData) =>
            mapToStandardInterval(streamData, API_RESOLUTIONS_MAP)
          ),
          map((streamData) => {
            candlesData = addChannelToCandlesData(candlesData, streamData);
            return streamData;
          }),
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
          takeUntil(closeStream$),
          repeatWhen(() => addTradingPairToStream$),
          multicast(() => new Subject())
        )
        .connect();

      setStatus({ isRunning: true });
      return status;
    },

    stop: (reset = true) => {
      closeStream$.next();
      closeStream$.complete();
      if (reset) {
        resetConf();
      }
      setStatus({ isRunning: false });
    },

    fetchCandles: async (pair, interval, start, end, limit) => {
      const makeCandlesUrlFn = (symbols, timeInterval, startTime, endTime) =>
        makeCandlesRestApiUrl(status.exchange.name, status.restRootUrl, {
          symbol: `${symbols[0]}${symbols[1]}`,
          interval: API_RESOLUTIONS_MAP[timeInterval],
          startTime,
          endTime,
        });

      return fetchCandles(pair, interval, start, end, limit, {
        status,
        options: { ...options, makeChunkCalls: true },
        makeCandlesUrlFn,
      });
    },

    getTradingPairs: () => pairs,

    getStatus: () => status,

    setDebug: (isDebug = false) => {
      status.debug = isDebug;
    },

    setApiUrl: (apiUrl) => {
      status.restRootUrl = makeCustomApiUrl(apiUrl);
    },

    addTradingPair(pair, pairConf) {
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
      const ticker = `${pair[0]}${pair[1]}`;
      const channel = `${conf.interval}:${ticker}`;
      const config = { ...conf, symbols: [...pair], ticker };

      if (pairs[channel]) {
        return debugError(ERROR.PAIR_ALREADY_DEFINED, status.debug);
      }

      pairs = addTradingPair(pairs, channel, config);

      if (status.isRunning) {
        if (ws.readyState === 1) {
          closeStream$.next();
        }

        addTradingPairToStream$.next();
      }

      return pairs;
    },

    removeTradingPair: (pair, interval) => {
      if (!Array.isArray(pair)) {
        return debugError(ERROR.PAIR_IS_NOT_ARRAY, status.debug);
      }

      if (!interval) {
        return debugError(ERROR.NO_TIME_FRAME_PROVIDED, status.debug);
      }

      const channel = `${interval}:${pair[0]}${pair[1]}`;

      if (!pairs[channel]) {
        return debugError(ERROR.PAIR_NOT_DEFINED, status.debug);
      }

      [pairs, candlesData] = removeTradingPair(pairs, channel, candlesData);

      return pairs;
    },

    data$: (channels) => data$(channels, dataStream$),
  };
})();

binance.options = {
  debug: false,
  intervals: API_RESOLUTIONS_MAP,
};

export default binance;
