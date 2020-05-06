/* eslint-disable global-require */
/* eslint-disable import/first */
/* global mocksClear */
/* global wsTestInstance$ */

import { Observable, Subject } from 'rxjs';
import makeSubs from '../utils/makeSubs';
import bitfinex from '../bitfinex';
import { subPairs, unsubPairs } from '../utils/wsUtils';
import mockWsData from './__fixtures__/wsData.json';
import { ERROR, WS_ROOT_URL } from '../const';
import { makeDataStream } from '../utils';
import { fetchCandles } from '../../../utils';

jest.mock('../utils/wsUtils');
jest.mock('../utils/makeDataStream');
jest.mock('../../../utils/makeCandlesRestApiUrl');
jest.mock('../../../utils/fetchCandles');
jest.mock('../utils/wsInstance', () =>
  jest.fn().mockImplementation(() => {
    return global.wsTestInstance$;
  })
);

const ws = { send: jest.fn(), close: jest.fn(), subs: {} };

const wsInstance$ = wsTestInstance$;

const mockObservable = new Subject();

describe('bitfinex connector', () => {
  beforeEach(() => {
    mocksClear([makeDataStream, subPairs, unsubPairs, ws.send, ws.close]);
    ws.subs = {};
    makeDataStream.mockImplementation(() => mockObservable);
  });

  it('should throw error on addTradingPair success', () => {
    jest.useFakeTimers();
    const interval = '1m';
    const result = bitfinex.addTradingPair(['ETH', 'USD'], { interval });

    expect(result).toEqual(null);

    bitfinex.start();

    wsInstance$.next({ ...ws, readyState: 1 });
    jest.runTimersToTime(1000);

    const tradingPairs = bitfinex.getTradingPairs();
    const expectedTragingPairs = {
      '1m:ETHUSD': {
        interval: '1m',
        symbols: ['ETH', 'USD'],
        ticker: 'ETHUSD',
      },
    };

    expect(tradingPairs).toEqual(expectedTragingPairs);

    expect(bitfinex.addTradingPair()).toEqual(
      new Error(ERROR.NO_CONFIGURATION_PROVIDED)
    );
    expect(bitfinex.addTradingPair('ETHUSD', { interval })).toEqual(
      new Error(ERROR.PAIR_IS_NOT_ARRAY)
    );
    expect(bitfinex.addTradingPair('ETHUSD')).toEqual(
      new Error(ERROR.NO_CONFIGURATION_PROVIDED)
    );
    expect(bitfinex.addTradingPair(['ETH', 'USD'], {})).toEqual(
      new Error(ERROR.NO_TIME_FRAME_PROVIDED)
    );
    expect(bitfinex.addTradingPair(['ETH', 'USD'], { interval })).toEqual(
      new Error(ERROR.PAIR_ALREADY_DEFINED)
    );

    bitfinex.stop();
    jest.clearAllTimers();
  });

  it('should throw error on removeTradingPair success', () => {
    const interval = '1m';
    makeDataStream.mockImplementation(() => mockObservable);

    expect(bitfinex.removeTradingPair()).toEqual(
      new Error(ERROR.PAIR_IS_NOT_ARRAY)
    );
    expect(bitfinex.removeTradingPair('ETHUSD', interval)).toEqual(
      new Error(ERROR.PAIR_IS_NOT_ARRAY)
    );
    expect(bitfinex.removeTradingPair(['ETH', 'USD'])).toEqual(
      new Error(ERROR.NO_TIME_FRAME_PROVIDED)
    );
    expect(bitfinex.removeTradingPair(['ETH', 'USD'], interval)).toEqual(
      new Error(ERROR.PAIR_NOT_DEFINED)
    );

    bitfinex.addTradingPair(['ETH', 'USD'], { interval });

    ws.subs = {
      123: {
        key: `trade:${interval}:tETHUSD`,
      },
    };

    bitfinex.start();
    wsInstance$.next({ ...ws, readyState: 1 });
    jest.runTimersToTime(1000);

    bitfinex.removeTradingPair(['ETH', 'USD'], interval);

    expect(bitfinex.getTradingPairs()).toEqual({});

    bitfinex.stop();
    ws.subs = {};
  });

  it('should run success', (done) => {
    const interval = '1m';

    bitfinex.setDebug(true);
    bitfinex.addTradingPair(['ETH', 'USD'], { interval });
    const status = bitfinex.start();
    expect(status).toEqual({
      isRunning: true,
      exchange: { name: 'bitfinex' },
      debug: true,
      restRootUrl: 'https://api-pub.bitfinex.com/v2',
      wsRootUrl: 'wss://api-pub.bitfinex.com/ws/2',
    });
    const tradingPairs = bitfinex.getTradingPairs();
    expect(makeDataStream).toHaveBeenCalledWith(WS_ROOT_URL, {
      initSubs: makeSubs(tradingPairs),
      wsInstance$,
    });

    const data$ = bitfinex.data$();

    expect(data$).toBeInstanceOf(Observable);

    data$.subscribe((data) => {
      expect(Object.values(data)[0]).toContainAllKeys([
        'pair',
        'interval',
        'candles',
        'meta',
        'seq',
      ]);
      bitfinex.stop();
      done();
    });
    mockObservable.next({
      data: JSON.stringify({
        event: 'subscribed',
        key: 'trade:1m:tBTCUSD',
        chanId: 1,
      }),
    });
    mockObservable.next({ data: JSON.stringify(mockWsData.event.data) });
  });

  it('should add trading pair before run success', () => {
    jest.useFakeTimers();
    const interval = '1m';
    bitfinex.addTradingPair(['ETH', 'USD'], { interval });
    let tradingPairs = bitfinex.getTradingPairs();
    expect(subPairs).not.toHaveBeenCalled();
    expect(tradingPairs).toEqual({});

    bitfinex.addTradingPair(['ZRX', 'USD'], { interval });
    tradingPairs = bitfinex.getTradingPairs();
    expect(subPairs).not.toHaveBeenCalled();
    expect(tradingPairs).toEqual({});

    bitfinex.start();
    wsInstance$.next({
      ...ws,
      readyState: 1,
    });
    jest.runTimersToTime(1000);
    tradingPairs = bitfinex.getTradingPairs();
    expect(subPairs).toHaveBeenCalledTimes(2);
    expect(tradingPairs).toEqual({
      '1m:ETHUSD': { interval, symbols: ['ETH', 'USD'], ticker: 'ETHUSD' },
      '1m:ZRXUSD': { interval, symbols: ['ZRX', 'USD'], ticker: 'ZRXUSD' },
    });
    jest.clearAllTimers();
    bitfinex.stop();
  });

  it('should add and remove trading pair after run success', () => {
    jest.useFakeTimers();
    const interval = '1m';
    bitfinex.setDebug(false);
    bitfinex.addTradingPair(['ETH', 'USD'], { interval });
    bitfinex.start();
    wsInstance$.next({
      ...ws,
      subs: {
        ETHUSD: { key: 'trade:1m:tETHUSD' },
        ZRXUSD: { key: 'trade:1m:tZRXUSD' },
      },
      readyState: 1,
    });
    jest.runTimersToTime(1000);
    let tradingPairs = bitfinex.getTradingPairs();
    expect(subPairs).toHaveBeenCalledTimes(1);
    expect(tradingPairs).toEqual({
      '1m:ETHUSD': { interval, symbols: ['ETH', 'USD'], ticker: 'ETHUSD' },
    });

    bitfinex.addTradingPair(['ZRX', 'USD'], { interval });
    tradingPairs = bitfinex.getTradingPairs();
    expect(subPairs).toHaveBeenCalledTimes(2);
    expect(tradingPairs).toEqual({
      '1m:ETHUSD': { interval, symbols: ['ETH', 'USD'], ticker: 'ETHUSD' },
      '1m:ZRXUSD': { interval, symbols: ['ZRX', 'USD'], ticker: 'ZRXUSD' },
    });

    ws.subs = {
      ETHUSD: { key: 'trade:1m:tETHUSD' },
      ZRXUSD: { key: 'trade:1m:tZRXUSD' },
    };
    bitfinex.removeTradingPair(['ZRX', 'USD'], interval);
    tradingPairs = bitfinex.getTradingPairs();
    expect(unsubPairs).toHaveBeenCalledTimes(1);
    expect(tradingPairs).toEqual({
      '1m:ETHUSD': { interval, symbols: ['ETH', 'USD'], ticker: 'ETHUSD' },
    });

    bitfinex.removeTradingPair(['ETH', 'USD'], interval);
    tradingPairs = bitfinex.getTradingPairs();
    expect(unsubPairs).toHaveBeenCalledTimes(2);
    expect(tradingPairs).toEqual({});
    jest.clearAllTimers();
    bitfinex.stop();
  });

  it('gets status success', () => {
    expect(bitfinex.getStatus()).toEqual({
      isRunning: false,
      exchange: {
        name: 'bitfinex',
      },
      debug: false,
      restRootUrl: 'https://api-pub.bitfinex.com/v2',
      wsRootUrl: 'wss://api-pub.bitfinex.com/ws/2',
    });
  });

  it('fetchCandles success', async () => {
    const pair = ['BTC', 'USD'];
    const interval = '1m';
    const start = 1565885185000;
    const end = 1565971645000;
    const limit = 1000;
    await bitfinex.fetchCandles(pair, interval, start, end, limit);
    expect(fetchCandles).toHaveBeenCalled();

    expect(fetchCandles.mock.calls[0][0]).toEqual(pair);
    expect(fetchCandles.mock.calls[0][1]).toEqual(interval);
    expect(fetchCandles.mock.calls[0][2]).toEqual(start);
    expect(fetchCandles.mock.calls[0][3]).toEqual(end);
    expect(fetchCandles.mock.calls[0][4]).toEqual(limit);
    expect(fetchCandles.mock.calls[0][5].status).toEqual(bitfinex.getStatus());
    expect(fetchCandles.mock.calls[0][5]).toContainKeys([
      'status',
      'options',
      'makeCandlesUrlFn',
    ]);
  });
});
