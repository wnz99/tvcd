import { WsEvent } from '../../../utils/ws/types';
import { PongData } from '../types';
/**
 * Receives the ping reply and returns a new timestamp
 *
 * @param  {WsEvent} event
 * @return (number | null)
 */
const onPongMsg = (event: WsEvent): number | null => {
  let data: PongData;

  try {
    data = JSON.parse(event.data);
  } catch (_e) {
    return null;
  }

  if (data.type === 'pong') {
    return new Date().valueOf();
  }

  return null;
};

export default onPongMsg;
