import debugError from './debugError'

let spyFn: ReturnType<typeof jest.spyOn>

beforeEach(() => {
  spyFn = jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn())
})

afterEach(() => {
  spyFn.mockRestore()
})

describe('debugError function', () => {
  it('returns error succes', () => {
    jest.spyOn(global.console, 'log')
    const debugMessage = debugError('test message', true)
    expect(spyFn).toHaveBeenCalled()
    expect(debugMessage).toEqual('test message')
  })
})
