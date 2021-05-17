/* eslint-disable no-console */
import { ClientError } from '../types/exchanges';

const debugError = (message: ClientError, isDebug?: boolean): string => {
  if (isDebug) {
    console.log(`tvcd => ${message}`);
  }

  return message;
};

export default debugError;
