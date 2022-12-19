import { Pair, TokensSymbols } from '../types'

const makePairData = (
  pair: TokensSymbols,
  conf: { interval: string; intervalApi: string }
): { pairKey: string; pairData: Pair } => {
  const ticker = `${pair[0]}:${pair[1]}`

  const pairKey = `${conf.interval}:${ticker}`

  const pairData: Pair = { ...conf, symbols: [...pair], ticker }

  return { pairKey, pairData }
}

export default makePairData
