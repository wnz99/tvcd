/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as exchanges from './exchanges';
import tvcdBase from './tvcdBase';
import { IExchange } from './types';

let instance: IExchange<any>;
let selectedExchange: any;

const tvcd = (exchange: string): IExchange<any> =>
  (() => {
    // @ts-ignore
    if (!exchanges[exchange]) {
      throw new Error(`${exchange} not supported.`);
    }

    if (!instance || selectedExchange !== exchange) {
      // @ts-ignore
      instance = { ...tvcdBase, ...exchanges[exchange] };
      selectedExchange = exchange;

      return instance;
    }
    return instance;
  })();

export default tvcd;
