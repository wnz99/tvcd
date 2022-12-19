import { catchErr, subPair, unsubPair } from '../subscribeWs'

const spyFn = jest.fn()
const spyFnError = jest.fn(() => {
  throw new Error('Error')
})
const pair = 'ETHUSD'
const chanId = 123

beforeEach(() => {
  spyFn.mockClear()
})

afterEach(() => {
  jest.clearAllTimers()
  spyFn.mockClear()
})

describe('subPair function', () => {
  it('should return a send function', () => {
    const sendFn = subPair(spyFn)

    expect(spyFn).not.toHaveBeenCalled()

    expect(sendFn).toBeInstanceOf(Function)
  })

  it('should return a text message', () => {
    let msg = {
      event: 'subscribe',
      channel: 'ticker',
      symbol: `t${pair}`,
    }

    subPair(spyFn)(pair, 'ticker')

    expect(spyFn).toHaveBeenCalledWith(JSON.stringify(msg))

    spyFn.mockClear()

    subPair(spyFn)(pair, 'book')

    msg = {
      event: 'subscribe',
      channel: 'book',
      symbol: `t${pair}`,
      freq: 'F1',
      prec: 'P0',
    }
    expect(spyFn).toHaveBeenCalledWith(JSON.stringify(msg))

    spyFn.mockClear()

    subPair(spyFn)(pair, '')

    expect(spyFn).not.toHaveBeenCalled()
  })
})

describe('unsubPair function', () => {
  it('should return a send function', () => {
    const sendFn = unsubPair(spyFn)

    expect(spyFn).not.toHaveBeenCalled()

    expect(sendFn).toBeInstanceOf(Function)
  })

  it('should return a text message', () => {
    const msg = {
      event: 'unsubscribe',
      chanId,
    }

    unsubPair(spyFn)(chanId)
    expect(spyFn).toHaveBeenCalledWith(JSON.stringify(msg))
  })
})

describe('catchErr function', () => {
  it('should execute send function', () => {
    catchErr(spyFn, 'test')
    expect(spyFn).toHaveBeenCalledWith('test')
  })

  it('catches error', () => {
    const spy = jest
      .spyOn(global.console, 'warn')
      .mockImplementation(() => jest.fn())
    catchErr(spyFnError, 'test')
    expect(spy).toHaveBeenCalled()
  })
})
