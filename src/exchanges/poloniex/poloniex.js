import { Subject, timer, from, merge } from 'rxjs';
import {
  map,
  multicast,
  takeUntil,
  filter,
  switchMap,
  catchError,
} from 'rxjs/operators';
import moment from 'moment';
import _omit from 'lodash/omit';

import {
  debugError,
  fetchCandles,
  makeCandlesRestApiUrl,
  makePairConfig,
  updateCandles,
  makeChannelFromDataStream,
  addChannelToCandlesData,
} from '../../utils';
import {
  ERROR,
  REST_ROOT_URL,
  API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
} from './const';
import { makeOptions } from './utils';
import { EXCHANGE_NAME, REAL_TIME } from '../../const';
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
            const tickers = Object.keys(pairs).map((channel) => {
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
                map((streamData) => [
                  symbols,
                  streamData[streamData.length - 1],
                  interval,
                ])
              );
            });

            return merge(...tickers).pipe(
              map((streamData) => {
                candlesData = addChannelToCandlesData(candlesData, streamData);

                return streamData;
              }),
              map((ticker) => {
                const channel = makeChannelFromDataStream(ticker);

                candlesData = updateCandles(
                  ticker,
                  candlesData,
                  options.format,
                  status.debug
                );

                if (candlesData[channel].meta.isNewCandle) {
                  dataStream$.next(candlesData);
                }

                return candlesData;
              })
            );
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
      closeStream$.next();
      closeStream$.complete();
      resetConf();
      setStatus({ isRunning: false });
    },

    fetchCandles: async (pair, interval, start, end, limit) => {
      const makeCandlesUrlFn = (symbols, timeInterval, startT, endT) =>
        makeCandlesRestApiUrl(status.exchange.name, status.restRootUrl, {
          currencyPair: `${symbols[1]}_${symbols[0]}`,
          period: API_RESOLUTIONS_MAP[timeInterval],
          start: moment(startT).unix(),
          end: moment(endT).unix(),
          resolution: 'auto',
        });

      // return fetchCandles(pair, interval, start, end, limit, {
      //   status,
      //   options: {
      //     ...options,
      //   },
      //   makeCandlesUrlFn,
      // });

      return fetchCandles(pair, interval, start, end, limit, {
        formatFn: options.format,
        // makeChunks: true,
        debug: {
          exchangeName: status.exchange.name,
          isDebug: status.debug,
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
      const channel = `${conf.interval}:${ticker}`;
      const config = { ...conf, symbols: [...pair], ticker };

      if (pairs[channel]) {
        return debugError(ERROR.PAIR_ALREADY_DEFINED, status.debug);
      }

      if (pairConf.interval === REAL_TIME) {
        pairs = { ...pairs, [channel]: config };
      } else {
        pairs = { [channel]: config };
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

      pairs = _omit(pair, [channel]);

      return pairs;
    },

    data$: (channels) => data$(channels, dataStream$),
  };
})();

poloniex.options = {
  debug: false,
  intervals: API_RESOLUTIONS_MAP,
};

export default poloniex;
