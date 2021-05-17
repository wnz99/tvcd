import { Subject } from 'rxjs';
import { map, multicast, takeUntil, repeatWhen } from 'rxjs/operators';
import {
  debugError,
  makeCandlesRestApiUrl,
  fetchCandles,
  updateCandles,
  makePairConfig,
  mapToStandardInterval,
  addChannelToCandlesData,
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
} from './utils';
import { EXCHANGE_NAME } from '../../const';
import { data$ } from '../../observables';

const binance = (function binance() {
  const dataStream$ = new Subject();
  let closeStream$ = new Subject();
  let wsInstance$ = new Subject();
  let addTradingPairToStream$ = new Subject();
  let candlesData = {};
  let tradingPairs = {};
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
    tradingPairs = {};
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

      if (Object.keys(tradingPairs).length === 0) {
        return debugError(ERROR.NO_INIT_PAIRS_DEFINED, status.debug);
      }

      const wsUrl = () => makeCandlesWsApiUrl(status.wsRootUrl, tradingPairs);

      dataSource$ = makeDataStream(wsUrl, { wsInstance$, debug: status.debug });

      wsInstance$.subscribe((instance) => {
        ws = instance;
      });

      dataSource$
        .pipe(
          map((streamEvent) => processStreamEvent(streamEvent, tradingPairs)),
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
        formatFn: options.format,
        makeChunks: true,
        debug: {
          exchangeName: status.exchange.name,
          isDebug: status.debug,
        },
        apiLimit: 1000,
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
      const channel = `${conf.interval}:${pair[0]}:${pair[1]}`;
      const config = { ...conf, symbols: [...pair], ticker };

      if (tradingPairs[channel]) {
        return debugError(ERROR.PAIR_ALREADY_DEFINED, status.debug);
      }

      tradingPairs = addTradingPair(tradingPairs, channel, config);

      if (status.isRunning) {
        if (ws.readyState === 1) {
          closeStream$.next();
        }

        addTradingPairToStream$.next();
      }

      return tradingPairs;
    },

    removeTradingPair: (pair, interval) => {
      if (!Array.isArray(pair)) {
        return debugError(ERROR.PAIR_IS_NOT_ARRAY, status.debug);
      }

      if (!interval) {
        return debugError(ERROR.NO_TIME_FRAME_PROVIDED, status.debug);
      }

      const channel = `${interval}:${pair[0]}${pair[1]}`;

      if (!tradingPairs[channel]) {
        return debugError(ERROR.PAIR_NOT_DEFINED, status.debug);
      }

      [tradingPairs, candlesData] = removeTradingPair(
        tradingPairs,
        channel,
        candlesData
      );

      return tradingPairs;
    },

    data$: (channels) => data$(channels, dataStream$),
  };
})();

binance.options = {
  debug: false,
  intervals: API_RESOLUTIONS_MAP,
};

export default binance;
