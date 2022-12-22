import { Pair } from '../../../types'
import makeInstrument from './makeInstrument'

const makeWsMsg = (
  messageType: string,
  pair: Pair
): { [key: string]: unknown } | string | undefined => {
  const { intervalApi, symbols } = pair

  const key = `trade:${intervalApi}:${makeInstrument(symbols)}`

  switch (messageType) {
    case 'subscribe': {
      return {
        event: 'subscribe',
        channel: 'candles',
        key,
      }
    }

    case 'unsubscribe': {
      return {
        event: 'unsubscribe',
        id: pair.ws?.meta?.chanid,
      }
    }

    default:
      return undefined
  }
}

export default makeWsMsg
