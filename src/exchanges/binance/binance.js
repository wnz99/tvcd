import { Subject } from 'rxjs';
import { map, multicast, takeUntil, repeatWhen } from 'rxjs/operators';
import {
  debugError,
  makeCandlesWsApiUrl,
  makeCandlesRestApiUrl,
  fetchCandles,
  updateCandles,
} from '../../utils';
import {
  ERROR,
  WS_ROOT_URL,
  REST_ROOT_URL,
  INTERVALS,
  makeCustomApiUrl,
} from './const';
import {
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

      const wsUrl = () =>
        makeCandlesWsApiUrl(status.exchange.name, status.wsRootUrl, pairs);
      dataSource$ = makeDataStream(wsUrl, { wsInstance$ });

      wsInstance$.subscribe((instance) => {
        ws = instance;
      });

      dataSource$
        .pipe(
          map((streamEvent) => processStreamEvent(streamEvent)),
          map((streamData) => {
            candlesData = addChannelToCandlesData(candlesData, streamData);
            return streamData;
          }),
          map((streamData) => {
            candlesData = updateCandles(
              streamData,
              candlesData,
              options.format
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

    fetchCandles: async (pair, interV, start, end, limit) => {
      const makeCandlesUrlFn = (symbols, interval, startTime, endTime) =>
        makeCandlesRestApiUrl(status.exchange.name, status.restRootUrl, {
          symbol: `${symbols[0]}${symbols[1]}`,
          interval,
          startTime,
          endTime,
        });
      return fetchCandles(pair, interV, start, end, limit, {
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

    addTradingPair(pair, conf) {
      if (!conf) {
        return debugError(ERROR.NO_CONFIGURATION_PROVIDED, status.debug);
      }
      if (conf && !conf.interval) {
        return debugError(ERROR.NO_TIME_FRAME_PROVIDED, status.debug);
      }
      if (!Array.isArray(pair)) {
        return debugError(ERROR.PAIR_IS_NOT_ARRAY, status.debug);
      }
      const ticker = `${pair[0]}${pair[1]}`;
      const channel = `${conf.interval}:${ticker}`;
      const config = { ...conf, symbols: [...pair], ticker };

      if (pairs[channel]) {
        return debugError(ERROR.PAIR_ALREADY_DEFINED, status.debug);
      }

      pairs = addTradingPair(pairs, channel, config);

      if (status.isRunning) {
        closeStream$.next();
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

      [pairs, candlesData] = removeTradingPair(ws, pairs, channel, candlesData);

      return pairs;
    },

    data$: (channels) => data$(channels, dataStream$),
  };
})();

binance.options = {
  debug: false,
  intervals: INTERVALS,
};

export default binance;
