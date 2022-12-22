import { Intervals } from '../../../types'
import { API_RESOLUTIONS_MAP, REST_ROOT_URL, WS_ROOT_URL } from '../const'
import { Exchanges } from './../../../types/exchanges'
import makeCustomApiUrl from './makeCustomApiUrl'

const getExchangeConf = (): {
  wsRootUrl: string
  restRootUrl: string
  exchangeName: Exchanges.deribit
  apiResolutionsMap: Intervals
  makeCustomApiUrl: (rootUrl: string) => string
  isUdf: boolean
} => ({
  wsRootUrl: WS_ROOT_URL,
  restRootUrl: REST_ROOT_URL,
  exchangeName: Exchanges.deribit,
  apiResolutionsMap: API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
  isUdf: true,
})

export default getExchangeConf
