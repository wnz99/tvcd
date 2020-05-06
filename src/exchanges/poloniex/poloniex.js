import { Subject, timer, from } from 'rxjs';
import { map, multicast, takeUntil, filter, switchMap } from 'rxjs/operators';
import moment from 'moment';

import {
  debugError,
  fetchCandles,
  updateCandles,
  makeCandlesRestApiUrl,
} from '../../utils';
import { ERROR, REST_ROOT_URL, INTERVALS, makeCustomApiUrl } from './const';
import { makeOptions, addChannelToCandlesData } from './utils';
import { EXCHANGE_NAME } from '../../const';
import { data$ } from '../../observables';

const poloniex = (function poloniex() {
  const dataStream$ = new Subject();
  let closeStream$ = new Subject();
  let candlesData = {};
  let pairs = {};
  let options;
  let status = {
    isRunning: false,
    exchange: { name: EXCHANGE_NAME.POLONIEX },
    debug: false,
  };

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
    start(opts = { format: 'tradingview' }) {
      if (status.isRunning) {
        return debugError(ERROR.SERVICE_IS_RUNNING, status.debug);
      }

      options = makeOptions(opts);
      timer(0, 5000)
        .pipe(
          switchMap(() => {
            const channel = Object.keys(pairs)[0];
            const { symbols, interval } = pairs[channel];
            const start = moment().subtract(5, 'minute').valueOf();
            const end = moment().valueOf();

            const candlesApiCall = this.fetchCandles(
              symbols,
              interval,
              start,
              end
            );
            return from(candlesApiCall).pipe(
              filter((data) => data.length),
              map((streamData) => {
                return [
                  `${symbols[0]}${symbols[1]}`,
                  streamData[streamData.length - 1],
                  interval,
                ];
              }),
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

    fetchCandles: async (pair, interV, start, end, limit) => {
      const makeCandlesUrlFn = (symbols, interval, startT, endT) =>
        makeCandlesRestApiUrl(status.exchange.name, status.restRootUrl, {
          currencyPair: `${symbols[1]}_${symbols[0]}`,
          period: interval,
          start: moment(startT).unix(),
          end: moment(endT).unix(),
          resolution: 'auto',
        });
      return fetchCandles(pair, interV, start, end, limit, {
        status,
        options: {
          ...options,
        },
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

poloniex.options = {
  debug: false,
  intervals: INTERVALS,
};

export default poloniex;
