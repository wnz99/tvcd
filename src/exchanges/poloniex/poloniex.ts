import _omit from 'lodash/omit';
import { Subject, Observable, from, timer, merge, of } from 'rxjs';
import {
  map,
  multicast,
  takeUntil,
  filter,
  switchMap,
  catchError,
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
import { PoloniexCandle } from './types';
import BaseExchange from '../base/baseExchange';
import { filterNullish } from '../../observables';

class Poloniex extends BaseExchange implements IExchange<PoloniexCandle> {
  constructor() {
    // super({ ...getExchangeConf(), wsConf: { makeWsMsg } });
    super({ ...getExchangeConf() });

    this._options = { format: formatter.tradingview };
  }

  _options!: ClientOptions<PoloniexCandle>;

  _dataSource$: Observable<WsEvent> | undefined = undefined;

  start = (opts: Options = { format: 'tradingview' }): undefined | string => {
    if (this._status.isRunning) {
      return debugError(ClientError.SERVICE_IS_RUNNING, this._status.isDebug);
    }

    this._options = makeOptions<PoloniexCandle>(opts, formatter);

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
            const start = moment().subtract(5, 'minute').valueOf();
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

              this._candlesData = updateCandles<Candle, PoloniexCandle>(
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
        catchError((error) => {
          if (this._status.isDebug) {
            console.warn(error);
          }
          return of(error);
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
          currencyPair: makePair(symbols[1], symbols[0]),
          period: this.options.intervals[timeInterval] as string,
          start: moment(startTime).unix(),
          end: moment(endTime).unix(),
          resolution: 'auto',
        }
      );

    return fetchCandles<PoloniexCandle>(pair, interval, start, end, {
      formatFn: this._options.format,
      debug: {
        exchangeName: this._exchangeConf.exchangeName,
        isDebug: this._status.isDebug,
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

export default Poloniex;
