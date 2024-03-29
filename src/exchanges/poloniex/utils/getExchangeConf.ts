import { Intervals } from '../../../types'
import { API_RESOLUTIONS_MAP, REST_ROOT_URL, WS_ROOT_URL } from '../const'
import { Exchanges } from './../../../types/exchanges'
import makeCustomApiUrl from './makeCustomApiUrl'
/**
 * Makes the exchange configuration.
 *
 * @return {
 *   wsRootUrl: string;
 *   restRootUrl: string;
 *   exchangeName: string;
 *   apiResolutionsMap: Intervals;
 *   makeCustomApiUrl: (rootUrl: string) => string;
 * }
 */

const getExchangeConf = (): {
  wsRootUrl: string
  restRootUrl: string
  exchangeName: Exchanges
  apiResolutionsMap: Intervals
  makeCustomApiUrl: (rootUrl: string) => string
} => ({
  wsRootUrl: WS_ROOT_URL,
  restRootUrl: REST_ROOT_URL,
  exchangeName: Exchanges.poloniex,
  apiResolutionsMap: API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
})

export default getExchangeConf
