import { CandlesData, StreamData } from '../types/exchanges'

const addChannelToCandlesData = <T>(
  candlesData: CandlesData,
  data: StreamData<T>
): CandlesData => {
  const channel = `${data[2]}:${data[0][0]}:${data[0][1]}`

  if (candlesData[channel]) {
    return candlesData
  }

  return {
    ...candlesData,
    [channel]: {
      pair: data[0],
      interval: data[2],
      candles: [],
      seq: 0,
      meta: {
        isSnapshot: false,
        isNewCandle: false,
        isUpdateCandle: false,
        updateIndex: undefined,
      },
    },
  }
}

export default addChannelToCandlesData
