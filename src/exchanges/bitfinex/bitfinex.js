import { Subject, interval as rxInterval } from 'rxjs';
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
  let pairs = {};
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

      dataSource$ = makeDataStream(status.wsRootUrl, {
        initSubs: makeSubs(pairs),
        wsInstance$,
      });

      wsInstance$.subscribe((instance) => {
        ws = instance;
      });

      dataSource$
        .pipe(
          map((streamEvent) => processStreamEvent(streamEvent)),
          filter((streamEvent) => streamEvent),
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
      const makeCandlesUrlFn = (symbols, timeInterval, startTime, endTime) =>
        makeCandlesRestApiUrl(status.exchange.name, status.restRootUrl, {
          symbol: makePair(symbols[0], symbols[1]),
          interval: timeInterval,
          start: startTime,
          end: endTime,
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
      const channel = `${conf.interval}:${ticker}`;
      const config = { ...conf, symbols: [...pair], ticker };

      if (pairs[channel]) {
        return debugError(ERROR.PAIR_ALREADY_DEFINED, status.debug);
      }

      if (ws && ws.readyState === 1) {
        pairs = addTradingPair(ws, pairs, channel, config);
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
          pairs = addTradingPair(ws, pairs, channel, config);
          return pairs;
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

      const channel = `${interV}:${pair[0]}${pair[1]}`;

      if (!pairs[channel]) {
        return debugError(ERROR.PAIR_NOT_DEFINED, status.debug);
      }

      [pairs, candlesData] = removeTradingPair(ws, pairs, channel, candlesData);

      return null;
    },

    data$: (channels) => data$(channels, dataStream$),
  };
})();

bitfinex.options = {
  debug: false,
  intervals: INTERVALS,
};

export default bitfinex;
