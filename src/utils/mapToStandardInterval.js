import _omit from 'lodash/omit';

import { REAL_TIME } from '../const';

const mapToStandardInterval = (streamData, apiResolutionsMap) => {
  const [ticker, data, intervalApi] = streamData;
  const intervals = _omit(apiResolutionsMap, [REAL_TIME]);
  const interval = Object.keys(intervals).find(
    (key) => intervals[key] === intervalApi
  );

  return [ticker, data, interval];
};

export default mapToStandardInterval;
