import { Intervals } from '../../../types/exchanges'
import { API_RESOLUTIONS_MAP, REST_ROOT_URL, WS_ROOT_URL } from '../const'
import { Exchanges } from './../../../types/exchanges'
import makeCustomApiUrl from './makeCustomApiUrl'

const getExchangeConf = (): {
  wsRootUrl: string
  restRootUrl: string
  exchangeName: Exchanges
  apiResolutionsMap: Intervals
  makeCustomApiUrl: (rootUrl: string) => string
} => ({
  wsRootUrl: WS_ROOT_URL,
  restRootUrl: REST_ROOT_URL,
  exchangeName: Exchanges.bitfinex,
  apiResolutionsMap: API_RESOLUTIONS_MAP as unknown as Intervals,
  makeCustomApiUrl,
})

export default getExchangeConf
