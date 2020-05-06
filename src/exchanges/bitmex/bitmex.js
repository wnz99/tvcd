import { Subject } from 'rxjs';
import { map, multicast, takeUntil, filter } from 'rxjs/operators';
import moment from 'moment';

import {
  debugError,
  makeCandlesRestApiUrl,
  fetchCandles,
  updateCandles,
} from '../../utils';
import {
  ERROR,
  WS_ROOT_URL,
  REST_ROOT_URL,
  INTERVALS,
  API_OPTIONS,
  makeCustomApiUrl,
} from './const';
import {
  makeDataStream,
  addTradingPair,
  makeOptions,
  makeSubs,
  removeTradingPair,
  processStreamEvent,
  addChannelToCandlesData,
} from './utils';
import { EXCHANGE_NAME } from '../../const';
import { data$ } from '../../observables';

const bitmex = (function bitmex() {
  const dataStream$ = new Subject();
  let closeStream$ = new Subject();
  let candlesData = {};
  let tradingPairs = {};
  let wsInstance$;
  let dataSource$;
  let ws;
  let options;
  let status = {
    isRunning: false,
    exchange: { name: EXCHANGE_NAME.BITMEX },
    debug: false,
    wsRootUrl: WS_ROOT_URL,
    restRootUrl: REST_ROOT_URL,
  };

  const resetConf = () => {
    closeStream$ = new Subject();
    tradingPairs = {};
    candlesData = {};
    wsInstance$ = undefined;
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
      if (Object.keys(tradingPairs).length === 0) {
        return debugError(ERROR.NO_INIT_tradingPairs_DEFINED, status.debug);
      }

      [wsInstance$, dataSource$] = makeDataStream(status.wsRootUrl, {
        initSubs: makeSubs(tradingPairs),
      });

      wsInstance$.subscribe((instance) => {
        ws = instance;
      });

      dataSource$
        .pipe(
          filter((streamEvent) => {
            const data = JSON.parse(streamEvent.data);
            return data.action === 'insert';
          }),
          map((streamEvent) => processStreamEvent(streamEvent)),
          filter((streamData) => streamData),
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

    fetchCandles: async (pair, interV, start, end, limit) => {
      const makeCandlesUrlFn = (symbols, interval, startT, endT) =>
        makeCandlesRestApiUrl(status.exchange.name, status.restRootUrl, {
          symbol: symbols[0],
          binSize: interval,
          columns: 'open,close,high,low,volume',
          startTime: moment(startT).toISOString(),
          endTime: moment(endT).toISOString(),
          count: API_OPTIONS.apiLimit,
        });
      return fetchCandles(pair, interV, start, end, limit, {
        status,
        options: {
          ...options,
          apiLimit: API_OPTIONS.apiLimit,
          makeChunkCalls: true,
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

    addTradingPair: (pair, conf) => {
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
      const channelName = `${conf.interval}:${ticker}`;
      const channelArgs = { ...conf, symbols: pair, ticker };

      if (tradingPairs[channelName]) {
        return debugError(ERROR.PAIR_ALREADY_DEFINED, status.debug);
      }

      tradingPairs = addTradingPair(ws, tradingPairs, channelName, channelArgs);

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
        ws,
        tradingPairs,
        channel,
        candlesData
      );

      return tradingPairs;
    },

    data$: (channels) => data$(channels, dataStream$),
  };
})();

bitmex.options = {
  debug: false,
  intervals: INTERVALS,
};

export default bitmex;
