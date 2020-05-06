import { PAIRS_MAP } from '../const';

const makePair = (baseSymbol, quoteSymbol) => {
  if (PAIRS_MAP[`${baseSymbol}:${quoteSymbol}`]) {
    return PAIRS_MAP[`${baseSymbol}:${quoteSymbol}`].value;
  }

  if (PAIRS_MAP[`${baseSymbol}${quoteSymbol}`]) {
    return PAIRS_MAP[`${baseSymbol}${quoteSymbol}`].value;
  }

  return `${baseSymbol}${quoteSymbol}`;
};

export default makePair;
