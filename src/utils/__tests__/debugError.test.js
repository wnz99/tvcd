import debugError from '../debugError';

let spyFn;

beforeEach(() => {
  spyFn = jest
    .spyOn(global.console, 'warn')
    .mockImplementation(() => jest.fn());
});

afterEach(() => {
  spyFn.mockRestore();
});

describe('debugError function', () => {
  it('returns error succes', () => {
    jest.spyOn(global.console, 'warn');
    const debugMessage = debugError('test message', true);
    expect(spyFn).toHaveBeenCalled();
    expect(debugMessage.message).toEqual('test message');
  });
});
