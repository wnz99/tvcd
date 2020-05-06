import * as ENV_PROD from './config.prod';
import * as ENV_DEV from './config.dev';

const PROD = true;

const conf = PROD ? ENV_PROD : ENV_DEV;

export default conf;
