import { BITFINEX } from '../../../const';
import { Intervals } from '../../../types';
import { API_RESOLUTIONS_MAP, WS_ROOT_URL, REST_ROOT_URL } from '../const';
import makeCustomApiUrl from './makeCustomApiUrl';

const getExchangeConf = (): {
  wsRootUrl: string;
  restRootUrl: string;
  exchangeName: string;
  apiResolutionsMap: Intervals;
  makeCustomApiUrl: (rootUrl: string) => string;
} => ({
  wsRootUrl: WS_ROOT_URL,
  restRootUrl: REST_ROOT_URL,
  exchangeName: BITFINEX,
  apiResolutionsMap: API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
});

export default getExchangeConf;
