/* global mocksClear */
import pingWs from '../pingWs'

const spySendFn = jest.fn()
const spyCbFn = jest.fn()
const pingMsg = { msg: 'test', time: 1000 }

beforeEach(() => {
  mocksClear([spySendFn, spyCbFn])
})

afterEach(() => {
  jest.clearAllTimers()
})

describe('pingWs function', () => {
  it('sends a ping and call cb success', () => {
    jest.useFakeTimers()

    const td = pingWs(spySendFn, spyCbFn, pingMsg.msg, pingMsg.time)

    expect(td).not.toBeNaN()

    jest.advanceTimersByTime(10000)

    expect(spySendFn).toHaveBeenCalledTimes(10)

    expect(spySendFn).toHaveBeenLastCalledWith(pingMsg.msg)

    expect(spyCbFn).toHaveBeenCalledTimes(10)
  })
})
