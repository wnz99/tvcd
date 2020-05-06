import makeDashPair from '../makeDashPair';

describe('makeDashPair function', () => {
  it('should detect DASH token correctly', () => {
    let tradingPair = makeDashPair('DSHUSD');
    expect(tradingPair).toEqual('DASHUSD');

    tradingPair = makeDashPair('ABCUSD');
    expect(tradingPair).toEqual('ABCUSD');
  });
});
