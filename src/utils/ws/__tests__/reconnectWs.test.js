import reconnectWs from '../reconnectWs';
import connectWs from '../connectWs';

jest.mock('../connectWs');
connectWs.mockReturnValue('success');

const spyCbFn = {
  onReconnectCb: jest.fn(),
};
const url = 'test';

beforeEach(() => {
  connectWs.mockClear();

  Object.keys(spyCbFn).forEach((fn) => {
    spyCbFn[fn].mockClear();
  });
});

afterEach(() => {
  jest.clearAllTimers();
});

describe('reconnectWs function', () => {
  it('does not run before retryDelay success', () => {
    const runTime = 1000;
    const retryDelay = 2000;
    const connOpts = {
      ...spyCbFn,
      retryDelay,
    };

    jest.useFakeTimers();

    reconnectWs(url, connOpts);

    jest.advanceTimersByTime(runTime);

    expect(connectWs).not.toHaveBeenCalled();

    expect(spyCbFn.onReconnectCb).not.toHaveBeenCalled();
  });
  it('does run after retryDelay success', () => {
    const runTime = 10000;
    const retryDelay = 2000;
    const connOpts = {
      ...spyCbFn,
      retryDelay,
    };
    jest.useFakeTimers();

    reconnectWs(url, connOpts);

    jest.advanceTimersByTime(runTime);

    expect(connectWs).toHaveBeenCalledTimes(1);

    expect(spyCbFn.onReconnectCb).toHaveBeenCalledTimes(1);

    expect(spyCbFn.onReconnectCb).toHaveBeenCalledWith('success');
  });
  it('does not call cb success', () => {
    const runTime = 10000;

    const retryDelay = 2000;

    const connOpts = {
      retryDelay,
    };
    jest.useFakeTimers();

    reconnectWs(url, connOpts);

    jest.advanceTimersByTime(runTime);

    expect(connectWs).toHaveBeenCalledTimes(1);

    expect(spyCbFn.onReconnectCb).not.toHaveBeenCalled();
  });
});
