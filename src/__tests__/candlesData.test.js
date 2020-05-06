import tvcd from '../tvcd';

describe('tvcd function', () => {
  it('should return same instance on same exchange succes', () => {
    const dataService1 = tvcd('bitfinex');
    const dataService2 = tvcd('bitfinex');
    expect(dataService1).toBe(dataService2);
  });

  it('should return new istance on new exchange succes', () => {
    const dataService1 = tvcd('bitfinex');
    const dataService2 = tvcd('binance');
    expect(dataService1).not.toBe(dataService2);
  });

  it('should throw error on unsupported exchange succes', () => {
    expect(() => tvcd('test')).toThrowErrorMatchingSnapshot();
  });
});
