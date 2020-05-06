import makePair from '../makePair';

describe('makePair function', () => {
  it('should return 4 chars token correctly', () => {
    const pair = makePair('DUSK', 'USD');
    expect(pair).toEqual('DUSK:USD');
  });

  it('should return 3 chars token correctly', () => {
    const pair = makePair('DTX', 'USD');
    expect(pair).toEqual('DTXUSD');
  });
});
