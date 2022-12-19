import { WsEvent } from '../../../utils/ws/types'
import { PongData } from '../types'
/**
 * Receives the ping reply and returns a new timestamp
 *
 * @param  {WsEvent} event
 * @return (number | null)
 */
const onPongMsg = (event: WsEvent): number | null => {
  if (event.data) {
    try {
      const data: PongData = JSON.parse(event.data)

      return data.time
    } catch (_e) {
      return null
    }
  }

  return null
}

export default onPongMsg
