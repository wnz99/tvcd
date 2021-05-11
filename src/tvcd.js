import * as exchanges from './exchanges';
import tvcdBase from './tvcdBase';

let instance;
let selectedExchange;

const tvcd = (exchange: string) =>
  (() => {
    if (!exchanges[exchange]) {
      throw new Error(`${exchange} not supported.`);
    }

    if (!instance || selectedExchange !== exchange) {
      instance = { ...tvcdBase, ...exchanges[exchange] };
      selectedExchange = exchange;

      return instance;
    }
    return instance;
  })();

export default tvcd;
