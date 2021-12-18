import _omit from 'lodash/omit';
import { Subject, Observable, from, timer, merge } from 'rxjs';
import { map, multicast, takeUntil, filter, switchMap } from 'rxjs/operators';
import moment from 'moment';

import {
  debugError,
  fetchCandles,
  updateCandles,
  makeOptions,
  makeCandlesRestApiUrl,
  addChannelToCandlesData,
  makeChannelFromDataStream,
} from '../../utils';
import { formatter, getExchangeConf, makePair } from './utils';
import { WsEvent } from '../../utils/ws/types';
import {
  IExchange,
  ClientError,
  ClientOptions,
  PairConf,
  TokensSymbols,
  Candle,
  Options,
  StreamData,
} from '../../types';
import { FtxCandle } from './types';
import BaseExchange from '../base/baseExchange';
import { filterNullish } from '../../observables';

class Ftx extends BaseExchange implements IExchange<FtxCandle> {
  constructor() {
    super({ ...getExchangeConf() });

    this._options = { format: formatter.tradingview };
  }

  _options!: ClientOptions<FtxCandle>;

  _dataSource$: Observable<WsEvent> | undefined = undefined;

  start = (opts: Options = { format: 'tradingview' }): undefined | string => {
    if (this._status.isRunning) {
      return debugError(ClientError.SERVICE_IS_RUNNING, this._status.isDebug);
    }

    this._options = makeOptions<FtxCandle>(opts, formatter);

    if (Object.keys(this._tradingPairs).length === 0) {
      return debugError(
        ClientError.NO_INIT_PAIRS_DEFINED,
        this._status.isDebug
      );
    }

    timer(0, 1000)
      .pipe(
        switchMap(() => {
          const fecthFn = Object.keys(this._tradingPairs).map((channel) => {
            const { symbols, interval } = this._tradingPairs[channel];
            const start = moment().subtract(1, 'minute').valueOf();
            const end = moment().valueOf();

            const candlesApiCall = this.fetchCandles(
              symbols,
              interval,
              start,
              end
            );

            return from(candlesApiCall).pipe<Candle[], StreamData<Candle>>(
              filter((data) => !!data && data.length !== 0),
              map((streamData) => [
                symbols,
                streamData[streamData.length - 1],
                interval,
              ])
            );
          });

          return merge(...fecthFn).pipe(
            filterNullish(),
            map((streamData) => {
              this._candlesData = addChannelToCandlesData<Candle>(
                this._candlesData,
                streamData
              );

              return streamData;
            }),
            filterNullish(),
            map((ticker) => {
              const channel = makeChannelFromDataStream(ticker);

              this._candlesData = updateCandles<Candle, FtxCandle>(
                ticker,
                this._candlesData,
                this._options.format,
                this._status.isDebug
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

    return undefined;
  };

  stop = (): void => {
    if (this._ws) {
      this._closeStream$.next(true);
      this._closeStream$.complete();
    }

    this._dataSource$ = undefined;
    this._resetInstance();
    this._status.isRunning = false;
  };

  fetchCandles = async (
    pair: TokensSymbols,
    interval: string,
    start: number,
    end: number
  ): Promise<Candle[]> => {
    const makeCandlesUrlFn = (
      symbols: TokensSymbols,
      timeInterval: string,
      startTime: number,
      endTime: number
    ) =>
      makeCandlesRestApiUrl(
        this._exchangeConf.exchangeName,
        this._exchangeConf.restRootUrl,
        {
          market_name: makePair(symbols[0], symbols[1]),
          resolution: this.options.intervals[timeInterval] as string,
          start_time: Math.ceil(startTime / 1000),
          end_time: Math.ceil(endTime / 1000),
        }
      );

    return fetchCandles<FtxCandle>(pair, interval, start, end, {
      formatFn: this._options.format,
      makeChunks: true,
      debug: {
        exchangeName: this._exchangeConf.exchangeName,
        isDebug: this._status.isDebug,
      },
      apiLimit: 5000,
      makeCandlesUrlFn,
    });
  };

  addTradingPair = (
    pair: TokensSymbols,
    pairConf: PairConf
  ): string | undefined => {
    try {
      this._addTradingPair(pair, pairConf);
    } catch (err) {
      if (err instanceof Error) {
        return err.message;
      }
    }

    return undefined;
  };

  removeTradingPair = (
    pair: TokensSymbols,
    interval: string
  ): string | undefined => {
    try {
      this._removeTradingPair(pair, interval);
    } catch (err) {
      if (err instanceof Error) {
        return err.message;
      }
    }

    return undefined;
  };
}

export default Ftx;
