import { Subject, timer } from 'rxjs';
import { map, multicast, takeUntil, filter, switchMap } from 'rxjs/operators';
import moment from 'moment';

import { debugError, fetchCandles, updateCandles } from '../../utils';
import { ERROR, REST_ROOT_URL, INTERVALS, makeCustomApiUrl } from './const';
import {
  makeOptions,
  makeCandlesUrl,
  shouldReturnCandles,
  addChannelToCandlesData,
  isNotPrevCandle,
} from './utils';
import { getTicker$ } from './observables';
import { EXCHANGE_NAME } from '../../const';
import { data$ } from '../../observables';

const bittrex = (function bittrex() {
  const dataStream$ = new Subject();
  let closeStream$ = new Subject();
  let candlesData = {};
  let pairs = {};
  let options;
  let status = {
    isRunning: false,
    exchange: { name: EXCHANGE_NAME.BITTREX },
    debug: false,
  };
  const availableDataForThePeriod = {};

  const resetConf = () => {
    closeStream$ = new Subject();
    pairs = {};
    candlesData = {};
    status = {
      ...status,
      isRunning: false,
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

      timer(0, 5000)
        .pipe(
          switchMap(() => {
            const channel = Object.keys(pairs)[0];

            return getTicker$(pairs[channel], status.restRootUrl).pipe(
              filter((streamData) => {
                return isNotPrevCandle(availableDataForThePeriod, streamData);
              }),
              map((streamData) => {
                candlesData = addChannelToCandlesData(candlesData, streamData);
                return streamData;
              }),
              map((ticker) => {
                candlesData = updateCandles(
                  ticker,
                  candlesData,
                  options.format
                );
                if (candlesData[channel].meta.isNewCandle) {
                  dataStream$.next(candlesData);
                }

                return candlesData;
              })
            );
          }),
          takeUntil(closeStream$),
          multicast(() => new Subject())
        )
        .connect();

      setStatus({ isRunning: true });
      return status;
    },

    stop: () => {
      closeStream$.next();
      closeStream$.complete();
      resetConf();
      setStatus({ isRunning: false });
    },

    fetchCandles: async (pair, interval, start, end, limit) => {
      const channel = `${interval}:${pair[0]}${pair[1]}`;

      if (shouldReturnCandles(end, availableDataForThePeriod[channel])) {
        availableDataForThePeriod[channel] = {
          start: moment(start).startOf('minute').valueOf(),
          end: moment(end).startOf('minute').valueOf(),
        };
        return fetchCandles(pair, interval, start, end, limit, {
          status,
          options: { ...options, makeChunkCalls: false },
          makeCandlesUrlFn: makeCandlesUrl(status, status.restRootUrl),
        });
      }

      return [];
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

      pairs = { [channel]: config };
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

      pairs = {};

      return pairs;
    },

    data$: (channels) => data$(channels, dataStream$),
  };
})();

bittrex.options = {
  debug: false,
  intervals: INTERVALS,
};

export default bittrex;
