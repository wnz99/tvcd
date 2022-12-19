import { DEVERSIFI } from '../../../const'
import { Intervals } from '../../../types'
import { API_RESOLUTIONS_MAP, REST_ROOT_URL, WS_ROOT_URL } from '../const'
import makeCustomApiUrl from './makeCustomApiUrl'

const getExchangeConf = (): {
  wsRootUrl: string
  restRootUrl: string
  exchangeName: string
  apiResolutionsMap: Intervals
  makeCustomApiUrl: (rootUrl: string) => string
} => ({
  wsRootUrl: WS_ROOT_URL,
  restRootUrl: REST_ROOT_URL,
  exchangeName: DEVERSIFI,
  apiResolutionsMap: API_RESOLUTIONS_MAP,
  makeCustomApiUrl,
})

export default getExchangeConf
