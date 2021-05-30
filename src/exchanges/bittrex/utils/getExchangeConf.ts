import { MakeCustomApiUrl } from '../../../types/exchanges';
import { BITTREX } from '../../../const';
import { Intervals } from '../../../types';
import { API_RESOLUTIONS_MAP, WS_ROOT_URL, REST_ROOT_URL } from '../const';
import makeCustomApiUrl from './makeCustomApiUrl';

const getExchangeConf = (): {
  wsRootUrl: string;
  restRootUrl: string;
  exchangeName: string;
  apiResolutionsMap: Intervals;
  makeCustomApiUrl: MakeCustomApiUrl;
} => ({
  wsRootUrl: WS_ROOT_URL,
  restRootUrl: REST_ROOT_URL,
  exchangeName: BITTREX,
  apiResolutionsMap: API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
});

export default getExchangeConf;
