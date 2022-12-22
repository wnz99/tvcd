import { ExchangeConf, Exchanges } from '../../../types'
import {
  API_RESOLUTIONS_MAP,
  REST_ROOT_FUTURES_COIN_URL,
  REST_ROOT_FUTURES_USD_URL,
  REST_ROOT_SPOT_URL,
  WS_ROOT_FUTURES_COIN_URL,
  WS_ROOT_FUTURES_USD_URL,
  WS_ROOT_SPOT_URL,
} from '../const'
import makeCustomApiUrl from './makeCustomApiUrl'

const getExchangeConf = (
  dataSet: 'spot' | 'usdFutures' | 'coinFutures'
): ExchangeConf => {
  switch (dataSet) {
    case 'usdFutures': {
      return {
        wsRootUrl: WS_ROOT_FUTURES_USD_URL,
        restRootUrl: REST_ROOT_FUTURES_USD_URL,
        exchangeName: Exchanges.binancefuturesusd,
        apiResolutionsMap: API_RESOLUTIONS_MAP,
        makeCustomApiUrl,
      }
    }

    case 'coinFutures': {
      return {
        wsRootUrl: WS_ROOT_FUTURES_COIN_URL,
        restRootUrl: REST_ROOT_FUTURES_COIN_URL,
        exchangeName: Exchanges.binancefuturescoin,
        apiResolutionsMap: API_RESOLUTIONS_MAP,
        makeCustomApiUrl,
      }
    }

    default: {
      return {
        wsRootUrl: WS_ROOT_SPOT_URL,
        restRootUrl: REST_ROOT_SPOT_URL,
        exchangeName: Exchanges.binance,
        apiResolutionsMap: API_RESOLUTIONS_MAP,
        makeCustomApiUrl,
      }
    }
  }
}

export default getExchangeConf
