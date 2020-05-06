const makeDashPair = (pair) => {
  const baseToken = pair.substring(0, 3);
  const quoteToken = pair.slice(-3);
  if (baseToken === 'DSH') {
    return `DASH${quoteToken}`;
  }

  return pair;
};

export default makeDashPair;
