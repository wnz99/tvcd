import { subPair, unsubPair, catchErr } from '../subscribeWs';

const spyFn = jest.fn();
const spyFnError = jest.fn(() => {
  throw new Error('Error');
});
const pair = 'ETHUSD';
const chanId = 123;

beforeEach(() => {
  spyFn.mockClear();
});

afterEach(() => {
  jest.clearAllTimers();
});

describe('subPair function', () => {
  it('returns a send function', () => {
    const sendFn = subPair(spyFn);

    expect(spyFn).not.toHaveBeenCalled();
    expect(sendFn).toBeInstanceOf(Function);
  });

  it('returns a text message', () => {
    let msg = {
      event: 'subscribe',
      channel: 'ticker',
      symbol: `t${pair}`,
    };

    subPair(spyFn)(pair, 'ticker');
    expect(spyFn).toHaveBeenCalledWith(JSON.stringify(msg));

    subPair(spyFn)(pair, 'book');
    msg = {
      event: 'subscribe',
      channel: 'book',
      symbol: `t${pair}`,
      freq: 'F1',
      prec: 'P0',
    };
    expect(spyFn).toHaveBeenCalledWith(JSON.stringify(msg));

    subPair(spyFn)(pair, '');
    expect(spyFn).toHaveBeenCalledWith(undefined);
  });
});

describe('unsubPair function', () => {
  it('returns a send function', () => {
    const sendFn = unsubPair(spyFn);

    expect(spyFn).not.toHaveBeenCalled();

    expect(sendFn).toBeInstanceOf(Function);
  });

  it('returns a text message', () => {
    const msg = {
      event: 'unsubscribe',
      chanId,
    };

    unsubPair(spyFn)(chanId);
    expect(spyFn).toHaveBeenCalledWith(JSON.stringify(msg));
  });
});

describe('catchErr function', () => {
  it('returns a send function', () => {
    const sendFn = catchErr(spyFn);
    expect(spyFn).not.toHaveBeenCalled();
    expect(sendFn).toBeInstanceOf(Function);
  });

  it('catchs error', () => {
    const spy = jest
      .spyOn(global.console, 'warn')
      .mockImplementation(() => jest.fn());
    catchErr(spyFnError)('test');
    expect(spy).toHaveBeenCalled();
  });
});
