const makePair = (baseSymbol: string, quoteSymbol: string): string => {
  if (quoteSymbol === 'USD') {
    return `${baseSymbol}/${quoteSymbol}`
  }

  return `${baseSymbol}-${quoteSymbol}`
}

export default makePair
