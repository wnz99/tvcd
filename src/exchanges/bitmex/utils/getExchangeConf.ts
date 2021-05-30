import { BITMEX } from '../../../const';
import { ExchangeConf } from '../../../types';
import {
  API_RESOLUTIONS_MAP,
  WS_ROOT_URL,
  REST_ROOT_URL,
  API_RESOLUTIONS_MAP_UDF,
  API_OPTIONS,
} from '../const';
import makeCustomApiUrl from './makeCustomApiUrl';

const getExchangeConf = (): ExchangeConf => ({
  wsRootUrl: WS_ROOT_URL,
  restRootUrl: REST_ROOT_URL,
  exchangeName: BITMEX,
  apiResolutionsMap: API_RESOLUTIONS_MAP,
  apiResolutionsUdfMap: API_RESOLUTIONS_MAP_UDF,
  makeCustomApiUrl,
  apiLimit: API_OPTIONS.apiLimit,
});

export default getExchangeConf;
