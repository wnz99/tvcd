import { StreamData } from '../types/exchanges';
/**
 * Creates the candles unique ticker from the API processed
 * stream.
 *
 * example:
 *
 * ```
 * <interval>:<base token>:<quote token>
 *
 * 1D:BTC:USD
 * ```
 *
 * @param  {StreamData<unknown>} data
 * @return string
 */
const makeChannelFromDataStream = (data: StreamData<unknown>): string =>
  `${data[2]}:${data[0][0]}:${data[0][1]}`;

export default makeChannelFromDataStream;
