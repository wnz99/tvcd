const candlesData = require('../index').default;

// const symbols = [
//   ['BTC', 'USD'],
//   ['ETH', 'USD'],
//   ['ZRX', 'USD'],
//   ['OMG', 'USD']
// ];

// Initiate exchange

const dataSource = candlesData('bitfinex');
const { options } = dataSource;

// Add pairs with time frame
dataSource.addTradingPair(['BTC', 'USD'], {
  interval: options.intervals['1m'],
});
dataSource.addTradingPair(['ETH', 'USD'], {
  interval: options.intervals['15m'],
});
dataSource.addTradingPair(['ZRX', 'USD'], {
  interval: options.intervals['1m'],
});

// Open connection
dataSource.start();

// Subscription to data Observable for all channels
dataSource.data$().subscribe((data) => {
  console.log(data);
});
