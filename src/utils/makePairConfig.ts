import { PairConf, Intervarls } from '../types';
import { REAL_TIME } from '../const';

const makePairConfig = (
  config: PairConf,
  intervals: Intervarls
): {
  interval: string | [string, string];
  intervalApi: string | [string, string];
} => ({
  interval:
    config.interval === REAL_TIME
      ? intervals.realtime[0]
      : intervals[config.interval],
  intervalApi:
    config.interval === REAL_TIME
      ? intervals.realtime[1]
      : intervals[config.interval],
});

export default makePairConfig;
