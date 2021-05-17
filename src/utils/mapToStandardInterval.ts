import _omit from 'lodash/omit';

import { REAL_TIME } from '../const';
import { StreamData } from '../types/exchanges';
/**
 * Replaces API interval with standard inbterval
 *
 * @template T
 * @param  {StreamData<T>} streamData
 * @param  {{ [key: string]: unknown }} apiResolutionsMap
 * @return StreamData<T>
 */
const mapToStandardInterval = <T>(
  streamData: StreamData<T>,
  apiResolutionsMap: { [key: string]: unknown }
): StreamData<T> => {
  const [ticker, data, intervalApi] = streamData;

  const intervals = _omit(apiResolutionsMap, [REAL_TIME]);

  const interval = Object.keys(intervals).find(
    (key) => intervals[key] === intervalApi
  );

  if (interval) {
    return [ticker, data, interval];
  }

  return streamData;
};

export default mapToStandardInterval;
