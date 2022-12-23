import tvcd from './tvcd'
import { Exchanges } from './types'

describe('tvcd', () => {
  it('should initialize all exchanges', () => {
    const exchanges = Object.values(Exchanges)

    exchanges.forEach((exchange) => {
      const dataSource = tvcd(exchange)

      expect(dataSource).toBeDefined()
    })
  })
})
