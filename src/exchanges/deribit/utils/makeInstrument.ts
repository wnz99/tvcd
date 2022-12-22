import { TokensSymbols } from '../../../types'

const makeInstrument = (pair: TokensSymbols): string => {
  if (pair[1] === 'USDC') {
    return pair.join('_')
  }

  return pair.join('-')
}

export default makeInstrument
