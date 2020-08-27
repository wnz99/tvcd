const makeCandlesWsApiUrl = (WS_ROOT_URL, pairs) => {
  const query = Object.keys(pairs).reduce(
    (acc, pair) =>
      `${acc}${pairs[pair].ticker.toLowerCase()}@kline_${
        pairs[pair].intervalApi
      }/`,
    ''
  );

  return `${WS_ROOT_URL}/stream?streams=${query.slice(0, -1)}`;
};

export default makeCandlesWsApiUrl;
