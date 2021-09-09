![Node.js CI](https://github.com/wnz99/tvcd/workflows/Node.js%20CI/badge.svg)

# tv-data-provider

```javascript
const symbols = [
  ['BTC', 'USD'],
  ['ETH', 'USD'],
  ['ZRX', 'USD'],
  ['OMG', 'USD'],
];

// Initiate exchange
const dataSource = tvcd('bitfinex');
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

// Subscription to data Observable for  channel
dataSource.data$(['1m:BTCUSD']).subscribe((data) => {
  console.log(data);
});

// Subscription to data Observable for  various channels
dataSource.data$(['1m:BTCUSD', '15m:ETHUSD']).subscribe((data) => {
  console.log(data);
});

// To get bars for a pair
// exchangeService.fetchCandles(pair, resolution, from, to)
const bars = await dataSource.fetchCandles(
  ['BTC', 'USD'],
  '1m',
  1565352406000,
  1565438866000
);
console.log(bars);
```
