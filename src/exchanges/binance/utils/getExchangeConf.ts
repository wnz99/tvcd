import {
  BINANCE,
  BINANCE_FUTURES_USD,
  BINANCE_FUTURES_COIN,
} from '../../../const';
import { ExchangeConf } from '../../../types';
import {
  WS_ROOT_FUTURES_USD_URL,
  REST_ROOT_FUTURES_USD_URL,
  API_RESOLUTIONS_MAP,
  WS_ROOT_FUTURES_COIN_URL,
  REST_ROOT_FUTURES_COIN_URL,
  WS_ROOT_SPOT_URL,
  REST_ROOT_SPOT_URL,
} from '../const';
import makeCustomApiUrl from './makeCustomApiUrl';

const getExchangeConf = (
  dataSet: 'spot' | 'usdFutures' | 'coinFutures'
): ExchangeConf => {
  switch (dataSet) {
    case 'usdFutures': {
      return {
        wsRootUrl: WS_ROOT_FUTURES_USD_URL,
        restRootUrl: REST_ROOT_FUTURES_USD_URL,
        exchangeName: BINANCE_FUTURES_USD,
        apiResolutionsMap: API_RESOLUTIONS_MAP,
        makeCustomApiUrl,
      };
    }

    case 'coinFutures': {
      return {
        wsRootUrl: WS_ROOT_FUTURES_COIN_URL,
        restRootUrl: REST_ROOT_FUTURES_COIN_URL,
        exchangeName: BINANCE_FUTURES_COIN,
        apiResolutionsMap: API_RESOLUTIONS_MAP,
        makeCustomApiUrl,
      };
    }

    default: {
      return {
        wsRootUrl: WS_ROOT_SPOT_URL,
        restRootUrl: REST_ROOT_SPOT_URL,
        exchangeName: BINANCE,
        apiResolutionsMap: API_RESOLUTIONS_MAP,
        makeCustomApiUrl,
      };
    }
  }
};

export default getExchangeConf;
