import tvcd from '../src';

// const symbols = [
//   ['BTC', 'USD'],
//   ['ETH', 'USD'],
//   ['ZRX', 'USD'],
//   ['OMG', 'USD']
// ];

// Initiate exchange

const dataSource = tvcd('bitfinex');
const { options } = dataSource;

dataSource.setDebug(true);

console.log('Supported resolutions: ', options.intervals);

// Add pairs with time frame
// dataSource.addTradingPair(['BTC', 'USD'], {
//   interval: '1m',
// });
// dataSource.addTradingPair(['ETH', 'USD'], {
//   interval: '15m',
// });
// dataSource.addTradingPair(['ZRX', 'USD'], {
//   interval: '1m',
// });

// Open connection
// dataSource.start();

dataSource
  .fetchCandles(
    ['BTC', 'USD'],
    '1m',
    1622391865 * 1000,
    new Date().valueOf(),
    1000
  )
  .then((result) => {
    console.log('result');
    console.log(result);
  });

// Subscription to data Observable for all channels
dataSource.data$().subscribe((data) => {
  console.log(data);
});
