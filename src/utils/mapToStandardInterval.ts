import _omit from 'lodash/omit'

import { REAL_TIME } from '../const'
import { Intervals, StreamData } from '../types/exchanges'
/**
 * Replaces API interval with standard interval
 *
 * @template T
 * @param  {StreamData<T>} streamData
 * @param  {{ [key: string]: unknown }} apiResolutionsMap
 * @return StreamData<T>
 */
const mapToStandardInterval = <T>(
  streamData: StreamData<T>,
  apiResolutionsMap: Intervals
): StreamData<T> | undefined => {
  const [ticker, data, intervalApi] = streamData

  const intervals = _omit(apiResolutionsMap, [REAL_TIME])

  const interval = Object.keys(intervals).find(
    (key) => intervals[key] === intervalApi
  )

  if (interval) {
    return [ticker, data, interval]
  }

  return undefined
}

export default mapToStandardInterval
