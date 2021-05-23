import _omit from 'lodash/omit';
import { Subject, merge, from, timer } from 'rxjs';
import { map, multicast, takeUntil, filter, switchMap } from 'rxjs/operators';
import moment from 'moment';
import { VALR } from '../../const';

import {
  debugError,
  fetchCandles,
  updateCandles,
  makeOptions,
  makeCandlesRestApiUrl,
  addChannelToCandlesData,
  makeChannelFromDataStream,
} from '../../utils';
import { formatter, makePair } from './utils';
import {
  IExchange,
  ClientError,
  Options,
  ClientOptions,
  PairConf,
  TokensSymbols,
  StreamData,
  Candle,
} from '../../types';
import {
  WS_ROOT_URL,
  REST_ROOT_URL,
  API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
} from './const';
import { ValrCandle } from './types';

import BaseExchange from '../base/baseExchange';

class Valr extends BaseExchange implements IExchange<ValrCandle> {
  _options!: ClientOptions<ValrCandle>;

  start = (opts: Options = { format: 'tradingview' }) => {
    if (this._status.isRunning) {
      return debugError(ClientError.SERVICE_IS_RUNNING, this._status.debug);
    }

    this._options = makeOptions<ValrCandle>(opts, formatter);

    timer(0, 5000)
      .pipe(
        switchMap(() => {
          const fecthFn = Object.keys(this._tradingPairs).map((channel) => {
            const { symbols, interval } = this._tradingPairs[channel];
            const start = moment().subtract(5, 'minute').valueOf();
            const end = moment().valueOf();

            const candlesApiCall = this.fetchCandles(
              symbols,
              interval,
              start,
              end,
              300
            );

            return from(candlesApiCall).pipe<Candle[], StreamData<Candle>>(
              filter((data) => !!data),
              map((streamData) => [symbols, streamData[0], interval])
            );
          });

          return merge(...fecthFn).pipe(
            map((streamData) => {
              this._candlesData = addChannelToCandlesData(
                this._candlesData,
                streamData
              );

              return streamData;
            }),
            map((ticker) => {
              const channel = makeChannelFromDataStream(ticker);

              this._candlesData = updateCandles(
                ticker,
                this._candlesData,
                this._options.format,
                this._status.debug
              );

              if (this._candlesData[channel].meta.isNewCandle) {
                this._dataStream$.next(this._candlesData);
              }

              return this._candlesData;
            })
          );
        }),
        takeUntil(this._closeStream$),
        multicast(() => new Subject())
      )
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .connect();

    this._status.isRunning = true;

    return this._status;
  };

  stop = () => {
    this._resetInstance();

    this._status.isRunning = false;
  };

  fetchCandles = async (
    pair: TokensSymbols,
    interval: string,
    start: number,
    end: number,
    limit: number
  ) => {
    const makeCandlesUrlFn = (
      symbols: TokensSymbols,
      timeInterval: string,
      startTime: number,
      endTime: number
    ) =>
      makeCandlesRestApiUrl(
        this._status.exchange.name,
        this._status.restRootUrl,
        {
          pair: makePair(symbols[0], symbols[1]),
          periodSeconds: API_RESOLUTIONS_MAP[timeInterval] as string,
          startTime: Math.ceil(startTime / 1000),
          endTime: Math.ceil(endTime / 1000),
        }
      );

    return fetchCandles<ValrCandle>(pair, interval, start, end, limit, {
      formatFn: this._options.format,
      makeChunks: true,
      apiLimit: 300,
      debug: {
        exchangeName: this._status.exchange.name,
        isDebug: this._status.debug,
      },
      makeCandlesUrlFn,
    });
  };

  addTradingPair = (
    pair: TokensSymbols,
    pairConf: PairConf
  ): string | undefined => {
    try {
      this._addTradingPair(pair, pairConf);

      return undefined;
    } catch (err) {
      return err.message;
    }
  };

  removeTradingPair = (
    pair: TokensSymbols,
    intervalApi: string
  ): string | undefined => {
    try {
      this._removeTradingPair(pair, intervalApi);
    } catch (err) {
      return err.message;
    }

    return undefined;
  };
}

export default new Valr({
  wsRootUrl: WS_ROOT_URL,
  restRootUrl: REST_ROOT_URL,
  exchangeName: VALR,
  apiResolutionsMap: API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
});
