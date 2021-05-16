import { Subject, timer, merge, config } from 'rxjs';
import {
  map,
  multicast,
  takeUntil,
  switchMap,
  catchError,
} from 'rxjs/operators';
import moment from 'moment';
import _omit from 'lodash/omit';

import {
  debugError,
  fetchCandles,
  updateCandles,
  makePairConfig,
  mapToStandardInterval,
  makeChannelFromDataStream,
  addChannelToCandlesData,
} from '../../utils';
import {
  ERROR,
  REST_ROOT_URL,
  API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
} from './const';
import {
  makeOptions,
  makeCandlesUrl,
  shouldReturnCandles,

  // Dont remove
  // isNotPrevCandle,
} from './utils';
import { getTicker$ } from './observables';
import { EXCHANGE_NAME, REAL_TIME } from '../../const';
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
            const tickers = Object.keys(pairs).map((channel) =>
              getTicker$(pairs[channel], status.restRootUrl)
            );

            return merge(...tickers).pipe(
              map((streamData) =>
                mapToStandardInterval(streamData, API_RESOLUTIONS_MAP)
              ),
              map((streamData) => {
                candlesData = addChannelToCandlesData(candlesData, streamData);
                return streamData;
              }),
              map((ticker) => {
                const channel = makeChannelFromDataStream(ticker);

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
      const channel = `${interval}:${pair[0]}${pair[1]}`;

      if (shouldReturnCandles(end, availableDataForThePeriod[channel])) {
        availableDataForThePeriod[channel] = {
          start: moment(start).startOf('minute').valueOf(),
          end: moment(end).startOf('minute').valueOf(),
        };

        return fetchCandles(pair, interval, start, end, limit, {
          formatFn: options.format,
          makeChunks: false,
          debug: {
            exchangeName: status.exchange.name,
            isDebug: status.debug,
          },
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
      const channel = `${conf.interval}:${pair[0]}:${pair[1]}`;
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

      const channel = `${interval}:${pair[0]}:${pair[1]}`;

      if (!pairs[channel]) {
        return debugError(ERROR.PAIR_NOT_DEFINED, status.debug);
      }

      pairs = _omit(pair, [channel]);

      return pairs;
    },

    data$: (channels) => data$(channels, dataStream$),
  };
})();

bittrex.options = {
  debug: false,
  intervals: API_RESOLUTIONS_MAP,
};

export default bittrex;
