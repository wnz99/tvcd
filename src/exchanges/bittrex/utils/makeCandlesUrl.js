import { makeCandlesRestApiUrl } from '../../../utils';
import { INTERVALS_CONVERSION } from '../const';

const makeCandlesUrl = (status, restRootUrl) => (symbols, interval) => {
  const tickInterval = INTERVALS_CONVERSION[interval];
  return makeCandlesRestApiUrl(status.exchange.name, restRootUrl, {
    marketName: `${symbols[1]}-${symbols[0]}`,
    tickInterval,
  });
};

export default makeCandlesUrl;
