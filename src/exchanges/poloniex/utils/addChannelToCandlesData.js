const addChannelToCandlesData = (candlesData, data) => {
  const channel = `${data[2]}:${data[0]}`;

  if (candlesData[channel]) {
    return candlesData;
  }

  return {
    ...candlesData,
    [channel]: {
      pair: data[0],
      interval: data[2],
      candles: [],
      updates: null,
      meta: { isSnapshot: false, isNewCandle: false, isUpdateCandle: false },
    },
  };
};

export default addChannelToCandlesData;
