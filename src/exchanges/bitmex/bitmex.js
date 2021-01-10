import { Subject, interval as rxInterval } from 'rxjs';
import {
  map,
  multicast,
  takeUntil,
  filter,
  skipUntil,
  take,
} from 'rxjs/operators';
import moment from 'moment';

import {
  debugError,
  makeCandlesRestApiUrl,
  fetchCandles,
  updateCandles,
  makePairConfig,
} from '../../utils';
import {
  ERROR,
  WS_ROOT_URL,
  REST_ROOT_URL,
  API_OPTIONS,
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
  addChannelToCandlesData,
  wsInst,
} from './utils';
import { EXCHANGE_NAME } from '../../const';
import { data$ } from '../../observables';

const bitmex = (function bitmex() {
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
    exchange: { name: EXCHANGE_NAME.BITMEX },
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
              options.format,
              status.debug
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

    fetchCandles: async (pair, interval, start, end, limit) => {
      const makeCandlesUrlFn = (symbols, timeInterval, startT, endT) =>
        makeCandlesRestApiUrl(status.exchange.name, status.restRootUrl, {
          symbol: `${symbols[0]}${symbols[1]}`,
          binSize: API_RESOLUTIONS_MAP[timeInterval],
          columns: 'open,close,high,low,volume',
          startTime: moment(startT).toISOString(),
          endTime: moment(endT).toISOString(),
          count: API_OPTIONS.apiLimit,
        });
      return fetchCandles(pair, interval, start, end, limit, {
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
      const ticker = `${pair[0]}${pair[1]}`;
      const channelName = `${conf.interval}:${ticker}`;
      const channelArgs = { ...conf, symbols: pair, ticker };

      if (tradingPairs[channelName]) {
        return debugError(ERROR.PAIR_ALREADY_DEFINED, status.debug);
      }

      if (ws && ws.readyState === 1) {
        tradingPairs = addTradingPair(
          ws,
          tradingPairs,
          channelName,
          channelArgs
        );
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
          tradingPairs = addTradingPair(
            ws,
            tradingPairs,
            channelName,
            channelArgs
          );

          return tradingPairs;
        });

      return null;
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
  intervals: API_RESOLUTIONS_MAP,
};

export default bitmex;
