import { PairConf, Intervals } from '../types';
import { REAL_TIME } from '../const';

const makePairConfig = (
  config: PairConf,
  apiResolutionMap: Intervals
): {
  interval: string;
  intervalApi: string;
} => ({
  interval:
    config.interval === REAL_TIME
      ? apiResolutionMap.realtime[0]
      : (config.interval as string),
  intervalApi:
    config.interval === REAL_TIME
      ? apiResolutionMap.realtime[1]
      : (apiResolutionMap[config.interval] as string),
});

export default makePairConfig;
