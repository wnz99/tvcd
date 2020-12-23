import makePair from '../utils/makePair';

describe('makePair bitfinex function', () => {
  it('should process BTCEUR pair', () => {
    const pair = makePair('BTC', 'EUR');
    const expectedSubArray = 'BTCEUR';
    expect(pair).toEqual(expectedSubArray);
  });

  it('should process BTCCNHT pair', () => {
    const pair = makePair('BTC', 'CNHT');
    const expectedSubArray = 'BTC:CNHT';
    expect(pair).toEqual(expectedSubArray);
  });

  it('should process EGLDUST pair', () => {
    const pair = makePair('EGLD', 'UST');
    const expectedSubArray = 'EGLD:UST';
    expect(pair).toEqual(expectedSubArray);
  });
});
