import Bitfinex from './bitfinex'

describe('Bitfinex', () => {
  it('should instantiate', () => {
    const dataSource = new Bitfinex()

    expect(dataSource).toBeDefined()
  })

  it('should have the proper methods', () => {
    const dataSource = new Bitfinex()

    expect(dataSource.addTradingPair).toBeDefined()
    expect(dataSource.fetchCandles).toBeDefined()
    expect(dataSource.start).toBeDefined()
    expect(dataSource.stop).toBeDefined()
    expect(dataSource.data$).toBeDefined()
  })
})
