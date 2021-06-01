import _omit from 'lodash/omit';
import { Subject, Observable, of, merge, from, timer } from 'rxjs';
import {
  map,
  multicast,
  takeUntil,
  catchError,
  filter,
  switchMap,
} from 'rxjs/operators';
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
import {
  formatter,
  getExchangeConf,
  makePair,
  shouldReturnCandles,
} from './utils';
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
import { BittrexCandle } from './types';
import BaseExchange from '../base/baseExchange';
import { filterNullish } from '../../observables';

class Bittrex extends BaseExchange implements IExchange<BittrexCandle> {
  constructor() {
    super({ ...getExchangeConf() });

    this._options = { format: formatter.tradingview };
  }

  _availableDataForThePeriod: {
    [key: string]: { start: number; end: number };
  } = {};

  _options!: ClientOptions<BittrexCandle>;

  _dataSource$: Observable<WsEvent> = new Observable();

  start = (opts: Options = { format: 'tradingview' }): undefined | string => {
    if (this._status.isRunning) {
      return debugError(ClientError.SERVICE_IS_RUNNING, this._status.isDebug);
    }

    this._options = makeOptions<BittrexCandle>(opts, formatter);

    if (Object.keys(this._tradingPairs).length === 0) {
      return debugError(
        ClientError.NO_INIT_PAIRS_DEFINED,
        this._status.isDebug
      );
    }

    timer(0, 5000)
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
              end,
              5000,
              { latest: true }
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

              this._candlesData = updateCandles<Candle, BittrexCandle>(
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
        catchError((error) => {
          console.warn(error);
          return of(error);
        }),
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

    this._dataSource$ = new Observable();
    this._resetInstance();
    this._status.isRunning = false;
  };

  fetchCandles = async (
    pair: TokensSymbols,
    interval: string,
    start: number,
    end: number,
    limit: number,
    opt?: { [key: string]: string | number | undefined | boolean }
  ): Promise<Candle[]> => {
    const channel = `${interval}:${pair[0]}:${pair[1]}`;

    if (shouldReturnCandles(end, this._availableDataForThePeriod[channel])) {
      this._availableDataForThePeriod[channel] = {
        start: moment(start).startOf('minute').valueOf(),
        end: moment(end).startOf('minute').valueOf(),
      };

      const makeCandlesUrlFn = (
        symbols: TokensSymbols,
        timeInterval: string,
        _startTime: number,
        _endTime: number
      ) =>
        makeCandlesRestApiUrl(
          this._exchangeConf.exchangeName,
          this._exchangeConf.restRootUrl,
          {
            marketName: makePair(symbols[1], symbols[0]),
            tickInterval: this.options.intervals[timeInterval] as string,
            isLatest: opt?.latest,
          }
        );

      return fetchCandles<BittrexCandle>(pair, interval, start, end, limit, {
        formatFn: this._options.format,
        makeChunks: false,
        debug: {
          exchangeName: this._exchangeConf.exchangeName,
          isDebug: this._status.isDebug,
        },
        makeCandlesUrlFn,
      });
    }

    return [];
  };

  addTradingPair = (
    pair: TokensSymbols,
    pairConf: PairConf
  ): string | undefined => {
    try {
      this._addTradingPair(pair, pairConf);
    } catch (err) {
      return err.message;
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
      return err.message;
    }

    return undefined;
  };
}

export default Bittrex;
