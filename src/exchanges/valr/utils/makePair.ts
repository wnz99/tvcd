/**
 *
 * @param  {string} baseSymbol
 * @param  {string} quoteSymbol
 * @return string
 */
const makePair = (baseSymbol: string, quoteSymbol: string): string =>
  `${baseSymbol}${quoteSymbol}`;

export default makePair;
