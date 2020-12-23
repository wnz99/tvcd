import { PAIRS_MAP } from '../const';

const makePair = (baseSymbol, quoteSymbol) => {
  if (baseSymbol.length === 3 && quoteSymbol.length === 3) {
    return `${baseSymbol}${quoteSymbol}`;
  }

  if (baseSymbol.length > 3 || quoteSymbol.length > 3) {
    return `${baseSymbol}:${quoteSymbol}`;
  }

  return `${baseSymbol}${quoteSymbol}`;
};

export default makePair;
