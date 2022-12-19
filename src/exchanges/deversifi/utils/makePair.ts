const makePair = (baseSymbol: string, quoteSymbol: string): string => {
  if (baseSymbol.length === 3 && quoteSymbol.length === 3) {
    return `${baseSymbol}${quoteSymbol}`
  }

  if (baseSymbol.length > 3 || quoteSymbol.length > 3) {
    return `${baseSymbol}:${quoteSymbol}`
  }

  return `${baseSymbol}${quoteSymbol}`
}

export default makePair
