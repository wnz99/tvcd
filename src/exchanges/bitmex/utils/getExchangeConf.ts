import { ExchangeConf, Exchanges } from '../../../types'
import {
  API_OPTIONS,
  API_RESOLUTIONS_MAP,
  API_RESOLUTIONS_MAP_UDF,
  REST_ROOT_URL,
  WS_ROOT_URL,
} from '../const'
import makeCustomApiUrl from './makeCustomApiUrl'

const getExchangeConf = (): ExchangeConf => ({
  wsRootUrl: WS_ROOT_URL,
  restRootUrl: REST_ROOT_URL,
  exchangeName: Exchanges.bitmex,
  apiResolutionsMap: API_RESOLUTIONS_MAP,
  apiResolutionsUdfMap: API_RESOLUTIONS_MAP_UDF,
  makeCustomApiUrl,
  apiLimit: API_OPTIONS.apiLimit,
})

export default getExchangeConf
