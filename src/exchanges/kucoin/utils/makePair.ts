/**
 *
 * @param  {string} baseSymbol
 * @param  {string} quoteSymbol
 * @return string
 */

const makePair = (symbols: [string, string]): string =>
  `${symbols[0]}-${symbols[1]}`;

export default makePair;
