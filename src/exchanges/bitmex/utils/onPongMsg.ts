import { WsEvent } from '../../../utils/ws/types';

/**
 * Receives the ping reply and returns a new timestamp
 *
 * @param  {WsEvent} event
 * @return (number | null)
 */
const onPongMsg = (event: WsEvent): number | null => {
  if (event.data === 'pong') {
    return new Date().getTime();
  }
  return null;
};

export default onPongMsg;
