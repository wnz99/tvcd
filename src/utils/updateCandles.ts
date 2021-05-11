import { CandlesData, Candle } from '../types';

export const isLastNthDataPoint = (
  points: number,
  candles: Candle[],
  entry: Candle
): [number, boolean] => {
  let isNew = true;

  let i = 0;

  for (i; i <= points - 1; i += 1) {
    if (candles[i] && entry.time === candles[i].time) {
      isNew = false;
      break;
    }
  }

  return [isNew ? 0 : i, isNew];
};

function updateCandles<D, F>(
  update: [string, D, string],
  candlesData: CandlesData,
  formatFn: (data: F) => Candle,
  debug: boolean
): CandlesData;

function updateCandles<F>(
  update: [string, unknown[], string],
  candlesData: CandlesData,
  formatFn: F,
  debug = false
): CandlesData {
  try {
    const [pair, data, interval] = update;

    const channel = `${interval}:${pair}`;

    // INITIAL SHAPSHOT
    if (Array.isArray(data[0])) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const candles = data.map((point) => formatFn(point));

      return {
        ...candlesData,
        [channel]: {
          pair,
          interval,
          candles,
          seq: 0,
          meta: {
            isSnapshot: true,
            isNewCandle: false,
            updateIndex: undefined,
            isUpdateCandle: false,
          },
        },
      };
    }

    // UPDATE
    if (!Array.isArray(data[0])) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const entry = formatFn(data);

      let meta;

      const candles = [...candlesData[channel].candles];

      const [i, isNew] = isLastNthDataPoint(2, candles, entry);

      if (isNew) {
        if (debug) {
          console.log(`tvcd => ${channel} => NEW candle => `, entry);
        }

        candles.unshift(entry);
        meta = {
          isSnapshot: false,
          isNewCandle: true,
          updateIndex: 0,
          isUpdateCandle: false,
        };
      } else {
        if (debug) {
          console.log(`tvcd => ${channel} => UPDATE candle ${i} => `, entry);
        }

        candles[i] = entry;
        meta = {
          isSnapshot: false,
          isNewCandle: false,
          updateIndex: i,
          isUpdateCandle: true,
        };
      }

      return {
        ...candlesData,
        [channel]: {
          pair,
          interval,
          candles: [...candles],
          seq: (candlesData[channel].seq || 0) + 1,
          meta,
        },
      };
    }

    return candlesData;
  } catch (e) {
    console.warn(e);
    throw e;
  }
}

export default updateCandles;
